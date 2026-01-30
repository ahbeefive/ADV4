// PostEmbedFixer class - Fixes video embeds in post section
// Ensures posts use the same embed conversion as products

class PostEmbedFixer {
    constructor(embedConverter) {
        if (typeof embedConverter !== 'function') {
            throw new Error('embedConverter must be a function');
        }
        this.convertToEmbedUrl = embedConverter;
    }
    
    /**
     * Fix all video embeds in the post section
     * @param {HTMLElement} postContainer - Container element with posts
     */
    fixPostEmbeds(postContainer) {
        if (!postContainer) {
            console.warn('PostEmbedFixer: postContainer is null or undefined');
            return;
        }
        
        // Find all iframes in the post container
        const iframes = postContainer.querySelectorAll('iframe');
        
        iframes.forEach(iframe => {
            const currentSrc = iframe.getAttribute('src');
            if (currentSrc) {
                try {
                    const embedUrl = this.fixVideoUrl(currentSrc);
                    if (embedUrl && embedUrl !== currentSrc) {
                        iframe.setAttribute('src', embedUrl);
                        console.log('PostEmbedFixer: Fixed video URL', { original: currentSrc, fixed: embedUrl });
                    }
                } catch (error) {
                    console.error('PostEmbedFixer: Error fixing video URL', error);
                    // Leave original URL unchanged on error
                }
            }
        });
    }
    
    /**
     * Fix a single video URL using the embed converter
     * @param {string} url - Original video URL
     * @returns {string} - Embed URL
     */
    fixVideoUrl(url) {
        if (!url || typeof url !== 'string') {
            return url;
        }
        
        try {
            return this.convertToEmbedUrl(url);
        } catch (error) {
            console.error('PostEmbedFixer: Error in convertToEmbedUrl', error);
            return url; // Return original URL on error
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PostEmbedFixer;
}
