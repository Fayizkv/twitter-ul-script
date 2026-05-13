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

    function renderLinks(posts) {
        linksList.innerHTML = '';
        
        posts.forEach((post, index) => {
            const cleanPost = post.replace(/\u200B/g, "").trim();
            const encoded = encodeURIComponent(cleanPost);
            const url = `https://twitter.com/intent/tweet?text=${encoded}`;

            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            
            linkItem.innerHTML = `
                <div class="link-content">
                    <span class="link-index">#${index + 1}</span>
                    <span class="link-preview">${cleanPost}</span>
                </div>
                <div class="link-actions">
                    <button class="btn outline small copy-btn" data-url="${url}">Copy Link</button>
                    <a href="${url}" target="_blank" class="tweet-btn">Tweet</a>
                </div>
            `;
            
            linksList.appendChild(linkItem);
        });

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
