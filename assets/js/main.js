// Loading Animation
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    
    // Hide loader after page load
    window.addEventListener('load', () => {
        loader.classList.add('hidden');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    });

    // Mobile Navigation
    const mobileNav = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');

    mobileToggle?.addEventListener('click', () => {
        mobileNav?.classList.toggle('active');
    });

    // Scroll reveal animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 3D Card Effect
    document.querySelectorAll('.card-3d').forEach(card => {
        let timeoutId;
        
        card.addEventListener('mousemove', e => {
            if (timeoutId) clearTimeout(timeoutId);
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = -(x - centerX) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            }, 100);
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Add loader handling
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    loader?.classList.add('fade-out');
    setTimeout(() => {
        loader?.remove();
    }, 1000);
});
