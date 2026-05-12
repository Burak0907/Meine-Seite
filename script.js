document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Scroll Fade-In Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(3, 7, 18, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(3, 7, 18, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth Scrolling for Nav Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for navbar
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fetch and render GitHub activity manually via JSON API
    async function fetchGitHubData() {
        const totalEl = document.getElementById('github-total');
        const streakEl = document.getElementById('github-streak');
        const graphContainer = document.getElementById('github-graph');
        
        if (!graphContainer) return;

        try {
            const response = await fetch('https://github-contributions-api.deno.dev/Burak0907.json');
            if (!response.ok) throw new Error('API fetch failed');
            const data = await response.json();
            
            // 1. Update Total
            if (totalEl) totalEl.textContent = data.totalContributions;
            
            // 2. Render Grid & Calculate Streak
            let currentStreak = 0;
            let streakActive = true;
            
            // The JSON contains a "contributions" array which holds arrays of weeks
            // Each week holds objects for each day
            const weeks = data.contributions;
            
            // Flatten the days to calculate streak from latest day backwards
            const allDays = [];
            weeks.forEach(week => {
                week.forEach(day => {
                    allDays.push(day);
                });
            });
            
            // Calculate streak (reverse order)
            for (let i = allDays.length - 1; i >= 0; i--) {
                const day = allDays[i];
                // Check if today is the very last item and it has 0, we can still count streak from yesterday
                if (i === allDays.length - 1 && day.contributionCount === 0) {
                    continue; // Skip today if no contributions yet, streak might be active from yesterday
                }
                
                if (day.contributionCount > 0) {
                    currentStreak++;
                } else {
                    break;
                }
            }
            if (streakEl) streakEl.textContent = currentStreak;
            
            // 3. Render Graph Grid
            graphContainer.innerHTML = ''; // clear mock
            
            weeks.forEach(week => {
                week.forEach(day => {
                    const cell = document.createElement('div');
                    cell.classList.add('graph-cell');
                    cell.title = `${day.contributionCount} contributions on ${day.date}`;
                    
                    if (day.contributionLevel === 'FIRST_QUARTILE') cell.classList.add('lvl-1');
                    else if (day.contributionLevel === 'SECOND_QUARTILE') cell.classList.add('lvl-2');
                    else if (day.contributionLevel === 'THIRD_QUARTILE') cell.classList.add('lvl-3');
                    else if (day.contributionLevel === 'FOURTH_QUARTILE') cell.classList.add('lvl-4');
                    
                    graphContainer.appendChild(cell);
                });
            });
            
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            if (totalEl) totalEl.textContent = 'Fehler';
            if (streakEl) streakEl.textContent = 'Fehler';
        }
    }
    
    fetchGitHubData();

    // Tech Stack Interaction
    const stackItems = document.querySelectorAll('.stack-item');
    const stackDetail = document.getElementById('stack-detail');
    const detailTitle = document.getElementById('stack-detail-title');
    const detailText = document.getElementById('stack-detail-text');

    if (stackItems.length > 0 && stackDetail) {
        // Change cursor to pointer for stack items
        stackItems.forEach(item => item.style.cursor = 'pointer');

        stackItems.forEach(item => {
            item.addEventListener('click', function() {
                // Remove active class from all
                stackItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked
                this.classList.add('active');

                // Get data
                const title = this.getAttribute('data-title');
                const text = this.getAttribute('data-text');

                // Update content
                detailTitle.textContent = title;
                detailText.textContent = text;

                // Show with animation
                stackDetail.style.display = 'block';
                // Trigger reflow
                void stackDetail.offsetWidth;
                stackDetail.style.opacity = '1';
                stackDetail.style.transform = 'translateY(0)';
            });
        });
    }
});
