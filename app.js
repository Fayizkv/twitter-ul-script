document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('campaignText');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const postCountBadge = document.getElementById('postCount');
    const resultsSection = document.getElementById('resultsSection');
    const linksList = document.getElementById('linksList');
    const copyAllBtn = document.getElementById('copyAllBtn');

    // Pre-fill with text.txt content if available
    fetch('text.txt')
        .then(response => response.text())
        .then(data => {
            if (data && data.length > 0) {
                textarea.value = data;
                const posts = splitIntoPosts(data);
                postCountBadge.textContent = `${posts.length} Posts Found`;
                renderLinks(posts);
                resultsSection.style.display = 'block';
            }
        })
        .catch(err => console.log('text.txt not found or inaccessible:', err));

    // Update post count as user types
    textarea.addEventListener('input', () => {
        const text = textarea.value;
        const posts = splitIntoPosts(text);
        postCountBadge.textContent = `${posts.length} Posts Found`;
    });

    generateBtn.addEventListener('click', async () => {
        const text = textarea.value.trim();
        if (!text) {
            alert('Please paste some text first.');
            return;
        }

        const shouldShorten = document.getElementById('shortenToggle').checked;
        const posts = splitIntoPosts(text);
        
        generateBtn.classList.add('loading');
        generateBtn.textContent = shouldShorten ? 'Shortening...' : 'Generating...';

        try {
            await renderLinks(posts, shouldShorten);
            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error(error);
            alert('Error generating links. Some links might not have been shortened.');
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.textContent = 'Generate Links';
        }
    });

    clearBtn.addEventListener('click', () => {
        textarea.value = '';
        postCountBadge.textContent = '0 Posts Found';
        resultsSection.style.display = 'none';
        linksList.innerHTML = '';
    });

    copyAllBtn.addEventListener('click', () => {
        const links = Array.from(document.querySelectorAll('.tweet-btn'))
            .map(btn => btn.href)
            .join('\n');
        
        navigator.clipboard.writeText(links).then(() => {
            const originalText = copyAllBtn.textContent;
            copyAllBtn.textContent = 'Copied!';
            copyAllBtn.classList.add('success');
            setTimeout(() => {
                copyAllBtn.textContent = originalText;
                copyAllBtn.classList.remove('success');
            }, 2000);
        });
    });

    function splitIntoPosts(text) {
        if (!text) return [];
        // Split by numbered posts (e.g., "1. ", "2. ", etc.)
        return text
            .split(/\n\s*\d+\.\s/)
            .map(p => p.trim())
            .filter(Boolean);
    }

    async function renderLinks(posts, shouldShorten = false) {
        linksList.innerHTML = '';
        
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const cleanPost = post.replace(/\u200B/g, "").trim();
            const encoded = encodeURIComponent(cleanPost);
            let url = `https://twitter.com/intent/tweet?text=${encoded}`;

            if (shouldShorten) {
                try {
                    // Note: TinyURL might have CORS restrictions in some browser environments
                    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
                    if (response.ok) {
                        const shortUrl = await response.text();
                        url = shortUrl;
                    }
                } catch (e) {
                    console.error('Shortening failed for post', i + 1, e);
                    // Fallback to long URL if shortening fails
                }
            }

            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            
            linkItem.innerHTML = `
                <div class="link-content">
                    <span class="link-index">#${i + 1}</span>
                    <span class="link-preview">${cleanPost}</span>
                </div>
                <div class="link-actions">
                    <button class="btn outline small copy-btn" data-url="${url}">Copy Link</button>
                    <a href="${url}" target="_blank" class="tweet-btn">Tweet</a>
                </div>
            `;
            
            linksList.appendChild(linkItem);
            
            // If shortening many links, add a small delay to avoid rate limits
            if (shouldShorten && posts.length > 5) {
                await new Promise(r => setTimeout(r, 100));
            }
        }

        // Add copy event listeners to individual buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.target.getAttribute('data-url');
                navigator.clipboard.writeText(url).then(() => {
                    const originalText = e.target.textContent;
                    e.target.textContent = 'Copied!';
                    setTimeout(() => {
                        e.target.textContent = originalText;
                    }, 2000);
                });
            });
        });
    }
});
