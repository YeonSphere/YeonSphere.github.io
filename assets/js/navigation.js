/**
 * Enhanced Navigation Features
 * Version: 1.0.0
 * Author: daedaevibin
 * Last Modified: 2025-02-08 02:51:14 UTC
 */

class NavigationFeatures {
    constructor() {
        // Configuration
        this.config = {
            scrollThreshold: 300,
            pullThreshold: 150,
            debounceDelay: 100,
            scrollUpThreshold: 80,
            horizontalScrollStep: 300
        };

        // State
        this.state = {
            initialized: false,
            pullStarted: false,
            touchStartY: 0,
            scrollTimeout: null
        };

        // Bind methods
        this.init = this.init.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.initHorizontalScrollIndicators = this.initHorizontalScrollIndicators.bind(this);
    }

    init() {
        if (this.state.initialized) return;

        this.initScrollButton();
        this.initSectionIndicators();
        this.initPullToRefresh();
        this.initHorizontalScrollIndicators();

        this.state.initialized = true;
        console.log('Navigation features initialized');
    }

    initScrollButton() {
        const button = document.createElement('button');
        button.className = 'floating-scroll-btn';
        button.setAttribute('aria-label', 'Scroll navigation');
        button.innerHTML = '<i class="fas fa-arrow-down"></i>';
        document.body.appendChild(button);

        window.addEventListener('scroll', this.handleScroll, { passive: true });

        button.addEventListener('click', () => {
            if (button.classList.contains('scroll-up')) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                this.scrollToNextSection();
            }
        });
    }

    scrollToNextSection() {
        const sections = Array.from(document.querySelectorAll('section'));
        const currentSection = sections.find(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= 0 && rect.bottom > 0;
        });
        
        if (currentSection) {
            const nextSection = sections[sections.indexOf(currentSection) + 1];
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    handleScroll() {
        if (this.state.scrollTimeout) {
            clearTimeout(this.state.scrollTimeout);
        }

        this.state.scrollTimeout = setTimeout(() => {
            const button = document.querySelector('.floating-scroll-btn');
            if (!button) return;

            const scrollPosition = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;

            if (scrollPosition > this.config.scrollThreshold) {
                button.classList.add('visible');
                
                if (scrollPercentage > this.config.scrollUpThreshold) {
                    button.classList.add('scroll-up');
                    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    button.setAttribute('aria-label', 'Scroll to top');
                } else {
                    button.classList.remove('scroll-up');
                    button.innerHTML = '<i class="fas fa-arrow-down"></i>';
                    button.setAttribute('aria-label', 'Scroll to next section');
                }
            } else {
                button.classList.remove('visible');
            }
        }, this.config.debounceDelay);
    }

    initSectionIndicators() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        if (!sections.length) return;

        const nav = document.createElement('nav');
        nav.className = 'section-indicators';
        nav.setAttribute('aria-label', 'Section navigation');

        sections.forEach(section => {
            const indicator = document.createElement('div');
            indicator.className = 'section-indicator';
            indicator.setAttribute('data-section', section.id);
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('tabindex', '0');
            
            const title = section.querySelector('h1, h2')?.textContent || 
                         section.getAttribute('aria-label') || 
                         section.id;
            
            indicator.setAttribute('title', title);
            indicator.setAttribute('aria-label', `Go to ${title} section`);

            indicator.addEventListener('click', () => {
                section.scrollIntoView({ behavior: 'smooth' });
            });

            indicator.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            });

            nav.appendChild(indicator);
        });

        document.body.appendChild(nav);
        this.initSectionObserver(sections);
    }

    initSectionObserver(sections) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const indicator = document.querySelector(
                        `.section-indicator[data-section="${entry.target.id}"]`
                    );
                    
                    if (entry.isIntersecting) {
                        indicator?.classList.add('active');
                        indicator?.setAttribute('aria-current', 'true');
                    } else {
                        indicator?.classList.remove('active');
                        indicator?.removeAttribute('aria-current');
                    }
                });
            },
            {
                threshold: 0.5
            }
        );

        sections.forEach(section => observer.observe(section));
    }

    initPullToRefresh() {
        const indicator = document.createElement('div');
        indicator.className = 'pull-refresh-indicator';
        indicator.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Pull to refresh</span>
        `;
        document.body.appendChild(indicator);

        document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd);
    }

    handleTouchStart(e) {
        if (window.scrollY === 0) {
            this.state.touchStartY = e.touches[0].clientY;
            this.state.pullStarted = true;
        }
    }

    handleTouchMove(e) {
        if (!this.state.pullStarted) return;

        const touchY = e.touches[0].clientY;
        const pullDistance = touchY - this.state.touchStartY;
        const indicator = document.querySelector('.pull-refresh-indicator');

        if (pullDistance > 0 && window.scrollY === 0) {
            indicator.style.transform = `translateX(-50%) translateY(${Math.min(pullDistance/2, this.config.pullThreshold)}px)`;
            indicator.style.opacity = Math.min(pullDistance / this.config.pullThreshold, 1);

            if (pullDistance > this.config.pullThreshold) {
                indicator.classList.add('ready');
                indicator.querySelector('span').textContent = 'Release to refresh';
            } else {
                indicator.classList.remove('ready');
                indicator.querySelector('span').textContent = 'Pull to refresh';
            }

            e.preventDefault();
        }
    }

    handleTouchEnd() {
        if (!this.state.pullStarted) return;

        const indicator = document.querySelector('.pull-refresh-indicator');
        const pullDistance = parseInt(indicator.style.transform.match(/translateY\((\d+)px\)/)?.[1] || '0');

        if (pullDistance >= this.config.pullThreshold) {
            indicator.classList.add('refreshing');
            indicator.querySelector('span').textContent = 'Refreshing...';
            location.reload();
        } else {
            indicator.style.transform = 'translateX(-50%) translateY(-100%)';
            indicator.style.opacity = '0';
        }

        this.state.pullStarted = false;
    }

    initHorizontalScrollIndicators() {
        document.querySelectorAll('.horizontal-scroll-container').forEach(container => {
            const prev = document.createElement('button');
            const next = document.createElement('button');
            
            prev.className = 'scroll-indicator prev';
            next.className = 'scroll-indicator next';
            
            prev.innerHTML = '<i class="fas fa-chevron-left"></i>';
            next.innerHTML = '<i class="fas fa-chevron-right"></i>';
            
            prev.setAttribute('aria-label', 'Scroll left');
            next.setAttribute('aria-label', 'Scroll right');
            
            prev.addEventListener('click', () => {
                container.scrollBy({
                    left: -this.config.horizontalScrollStep,
                    behavior: 'smooth'
                });
            });
            
            next.addEventListener('click', () => {
                container.scrollBy({
                    left: this.config.horizontalScrollStep,
                    behavior: 'smooth'
                });
            });
            
            container.appendChild(prev);
            container.appendChild(next);
            
            // Show/hide scroll indicators based on scroll position
            const updateIndicators = () => {
                prev.style.display = container.scrollLeft > 0 ? 'flex' : 'none';
                next.style.display = 
                    container.scrollLeft < container.scrollWidth - container.clientWidth ? 
                    'flex' : 'none';
            };
            
            container.addEventListener('scroll', updateIndicators, { passive: true });
            window.addEventListener('resize', updateIndicators, { passive: true });
            updateIndicators();
        });
    }
}

// Initialize navigation features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new NavigationFeatures();
    navigation.init();
});