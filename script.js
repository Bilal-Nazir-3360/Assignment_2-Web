$(document).ready(function() {
    let chatVisible = false;
    const chatBox = $('.chat-box');
    let allReviews = [];
    let remainingReviews = [];

    // Add custom easing function for smoother animations
    $.easing.easeOutExpo = function (x, t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) * 1024 / 1023 + b;
    };

    // Show notification modal with delay
    setTimeout(() => {
        $('#notificationModal').modal('show');
        // Add animation to the cards
        setTimeout(() => {
            $('.modal .card').addClass('animate__animated animate__fadeInUp');
        }, 300);
    }, 2000);

    function loadJSONData() {
        showLoadingSpinner();
        
        // Load stats data
        $.ajax({
            url: 'data/stats.json',
            dataType: 'json',
            success: function(data) {
                if (data && data.stats) {
                    renderStats(data.stats);
                }
                hideLoadingSpinner();
            },
            error: function(xhr, status, error) {
                console.error("Error loading stats:", error);
                hideLoadingSpinner();
            }
        });

        $.ajax({
            url: 'data/features.json',
            dataType: 'json',
            success: function(data) {
                renderFeatures(data.features);
                hideLoadingSpinner();
            },
            error: function(xhr, status, error) {
                console.error("Error loading features:", error);
                hideLoadingSpinner();
            }
        });

        $.ajax({
            url: 'data/reviews.json',
            dataType: 'json',
            success: function(data) {
                const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
                allReviews = [...data.reviews, ...userReviews].sort((a, b) => 
                    new Date(b.date) - new Date(a.date));
                renderReviews();
            },
            error: function(xhr, status, error) {
                console.error("Error loading reviews:", error);
            }
        });
    }

    function renderFeatures(features) {
        const container = $('#featuresContainer');
        container.empty();
        features.forEach((feature, index) => {
            const delay = index * 0.2;
            let featureLink = '';
            
            // Map feature index to corresponding feature page
            if (index === 0) {
                featureLink = 'features-1.html';
            } else if (index === 1) {
                featureLink = 'features-2.html';
            } else if (index === 2) {
                featureLink = 'features-3.html';
            } else if (index === 3) {
                featureLink = 'features-4.html';
            } else if (index === 4) {
                featureLink = 'features-5.html';
            } else if (index === 5) {
                featureLink = 'features-6.html';
            }
            
            const featureHtml = `
                <div class="col-md-4 mb-4">
                    <div class="card feature-card animate__animated animate__fadeInUp" style="animation-delay: ${delay}s">
                        <div class="card-body">
                            <i class="${feature.icon} fa-3x mb-3"></i>
                            <h5 class="card-title">${feature.title}</h5>
                            <p class="card-text">${feature.description}</p>
                            ${featureLink ? `<a href="${featureLink}" class="btn btn-custom mt-3">Learn More</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
            container.append(featureHtml);
        });
    }

    function renderReviews() {
        const container = $('#reviewsContainer');
        container.empty();
        const initialReviews = allReviews.slice(0, 4);
        remainingReviews = allReviews.slice(4);

        initialReviews.forEach((review, index) => {
            container.append(createReviewHtml(review, index));
        });

        if (allReviews.length > 4) {
            container.append(`
                <div class="col-12 text-center">
                    <button class="btn show-more-btn" id="showMoreReviews">
                        Show More Reviews
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            `);

            $('#showMoreReviews').off('click').click(function() {
                const isExpanded = $(this).hasClass('expanded');
                $(this).toggleClass('expanded');
                
                if (!isExpanded) {
                    remainingReviews.forEach((review, index) => {
                        $(createReviewHtml(review, index + 4)).hide().appendTo(container).slideDown(400);
                    });
                    $(this).html('Show Less <i class="fas fa-chevron-up"></i>');
                    remainingReviews = [];
                } else {
                    $('.review-card').slice(4).slideUp(400, () => $(this).remove());
                    $(this).html('Show More Reviews <i class="fas fa-chevron-down"></i>');
                    remainingReviews = allReviews.slice(4);
                }
                
                $('html, body').animate({scrollTop: $(this).offset().top - 100}, 800);
            });
        }
    }

    function createReviewHtml(review, index) {
        const delay = index * 0.1;
        return `
            <div class="col-md-6 mb-4">
                <div class="review-card animate__animated animate__fadeIn" style="animation-delay: ${delay}s">
                    <div class="review-header">
                        <div class="user-avatar">${review.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <h5 class="mb-0">${review.name}</h5>
                            <div class="rating-stars">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                    </div>
                    <p class="review-text">${review.text}</p>
                    <div class="review-date">
                        ${new Date(review.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            </div>
        `;
    }

    function renderStats(stats) {
        const container = $('#statsContainer');
        container.empty();
        
        // Define icons for each stat
        const statIcons = {
            'active_users': 'fas fa-users',
            'tasks_completed': 'fas fa-tasks',
            'teams_using': 'fas fa-users-cog',
            'five_star_reviews': 'fas fa-star'
        };
        
        Object.keys(stats).forEach((key, index) => {
            const icon = statIcons[key] || 'fas fa-chart-line';
            const delay = index * 0.2;
            
            const statHtml = `
                <div class="col-md-3 col-6 mb-4">
                    <div class="stat-card animate__animated animate__fadeInUp" style="animation-delay: ${delay}s">
                        <i class="${icon}"></i>
                        <h3 class="stat-number" data-count="${stats[key]}">0</h3>
                        <p class="stat-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    </div>
                </div>
            `;
            container.append(statHtml);
        });

        // Initialize stats animation
        animateStats();
    }

    // Stats animation
    function animateStats() {
        $('.stat-number').each(function() {
            const $this = $(this);
            const countTo = parseInt($this.attr('data-count'));
            
            $({ countNum: 0 }).animate({
                countNum: countTo
            }, {
                duration: 2000,
                easing: 'easeOutExpo',
                step: function() {
                    $this.text(Math.floor(this.countNum).toLocaleString());
                },
                complete: function() {
                    $this.text(countTo.toLocaleString());
                }
            });
        });
    }

    // Trigger stats animation when in viewport
    function checkStatsInView() {
        const statsSection = $('#statsContainer');
        if (statsSection.length) {
            const windowHeight = $(window).height();
            const scrollTop = $(window).scrollTop();
            const elementTop = statsSection.offset().top;
            
            if (elementTop < (scrollTop + windowHeight - 100)) {
                animateStats();
                $(window).off('scroll.stats');
            }
        }
    }

    // Initialize stats animation check
    $(window).on('scroll.stats', checkStatsInView);

    // Initialize star rating
    $('.rating-input i').hover(
        function() {
            const rating = $(this).data('rating');
            $('.rating-input i').removeClass('fas active').addClass('far');
            for (let i = 1; i <= rating; i++) {
                $(`.rating-input i[data-rating="${i}"]`).removeClass('far').addClass('fas active');
            }
        },
        function() {
            const currentRating = parseInt($('#reviewRating').val());
            $('.rating-input i').removeClass('fas active').addClass('far');
            for (let i = 1; i <= currentRating; i++) {
                $(`.rating-input i[data-rating="${i}"]`).removeClass('far').addClass('fas active');
            }
        }
    );

    $('.rating-input i').click(function() {
        const rating = $(this).data('rating');
        $('#reviewRating').val(rating);
        $('.rating-input i').removeClass('fas active').addClass('far');
        for (let i = 1; i <= rating; i++) {
            $(`.rating-input i[data-rating="${i}"]`).removeClass('far').addClass('fas active');
        }
    });

    // Initialize with default rating
    const defaultRating = 3;
    $('#reviewRating').val(defaultRating);
    $('.rating-input i').removeClass('fas active').addClass('far');
    for (let i = 1; i <= defaultRating; i++) {
        $(`.rating-input i[data-rating="${i}"]`).removeClass('far').addClass('fas active');
    }

    $('#reviewForm').submit(function(e) {
        e.preventDefault();
        const name = $('#reviewName').val();
        const text = $('#reviewText').val();
        const rating = parseInt($('#reviewRating').val());
        
        if (name && text) {
            const newReview = {
                name: name,
                text: text,
                rating: rating,
                date: new Date().toISOString()
            };

            const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
            userReviews.push(newReview);
            localStorage.setItem('userReviews', JSON.stringify(userReviews));
            
            allReviews.unshift(newReview);
            renderReviews();
            
            $('#reviewName').val('');
            $('#reviewText').val('');
            $('#reviewRating').val(3);
            $('.rating-input i').removeClass('fas active').addClass('far');
            $('.rating-input i').each(function() {
                if ($(this).data('rating') <= 3) {
                    $(this).removeClass('far').addClass('fas active');
                }
            });
            showToast('Review submitted successfully!');
        }
    });

    $('#contactForm').submit(function(e) {
        e.preventDefault();
        const name = $('#contactName').val();
        const email = $('#contactEmail').val();
        const message = $('#contactMessage').val();
        
        if (name && email && message) {
            showLoadingSpinner();
            setTimeout(() => {
                hideLoadingSpinner();
                $('#contactForm')[0].reset();
                showToast('Message sent successfully! We will contact you soon.');
            }, 1500);
        }
    });

    function toggleChat() {
        chatVisible = !chatVisible;
        const chatBox = $('.chat-box');
        const chatLogo = $('.chat-logo');
        
        if (chatVisible) {
            chatBox.addClass('open').animate({ bottom: '30px' }, {
                duration: 400,
                easing: 'easeOutExpo',
                start: function() {
                    chatBox.css('display', 'block');
                    chatLogo.fadeOut(300);
                }
            });
        } else {
            chatBox.removeClass('open').animate({ bottom: '-400px' }, {
                duration: 400,
                easing: 'easeInExpo',
                complete: function() {
                    chatBox.css('display', 'none');
                    chatLogo.fadeIn(300);
                }
            });
        }
    }

    function minimizeChat() {
        chatVisible = false;
        const chatBox = $('.chat-box');
        const chatBadge = $('.chat-badge');
        
        chatBox.animate({ bottom: '-350px' }, {
            duration: 400,
            easing: 'easeInExpo',
            complete: function() {
                chatBox.addClass('minimized');
            }
        });
        chatBadge.fadeIn(300);
    }

    function maximizeChat() {
        chatVisible = true;
        const chatBox = $('.chat-box');
        const chatBadge = $('.chat-badge');
        
        chatBox.removeClass('minimized');
        chatBox.animate({ bottom: '30px' }, {
            duration: 400,
            easing: 'easeOutExpo'
        });
        chatBadge.fadeOut(300);
    }

    function sendMessage() {
        const inputField = $('#chatInput');
        const message = inputField.val().trim();
        
        if (message) {
            appendMessage('user', message);
            inputField.val('');
            showTypingIndicator();
            
            setTimeout(() => {
                hideTypingIndicator();
                appendMessage('bot', getBotResponse(message));
            }, 1500);
        }
    }

    function appendMessage(sender, message) {
        const chatBody = $('.chat-body');
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageElement = $(`
            <div class="chat-message ${sender}">
                <div class="message-content">
                    ${sender === 'user' ? '' : '<span class="avatar">🤖</span>'}
                    <div class="text">${message}</div>
                    ${sender === 'user' ? '<span class="avatar">👤</span>' : ''}
                    <span class="timestamp">${timestamp}</span>
                </div>
            </div>
        `);
        
        chatBody.append(messageElement);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const chatBody = $('.chat-body');
        const typingIndicator = $(`
            <div class="typing-indicator">
                <span class="avatar">🤖</span>
                <span>Agent is typing</span>
            </div>
        `);
        chatBody.append(typingIndicator);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        $('.typing-indicator').remove();
    }

    function scrollToBottom() {
        const chatBody = $('.chat-body');
        chatBody.stop().animate({
            scrollTop: chatBody[0].scrollHeight
        }, 300);
    }

    function getBotResponse(userMessage) {
        const responses = {
            'hello': 'Hi there! How can I help you today?',
            'hi': 'Hello! How can I assist you?',
            'how are you': 'I am just a bot, but I am functioning perfectly! 😊',
            'features': 'PlanPilot offers task organization, progress tracking, and team collaboration features.',
            'bye': 'Goodbye! Have a great day!',
            'contact': 'You can reach us at contact@PlanPilot.com or through our contact form.',
            'price': 'PlanPilot offers various pricing plans. Would you like me to show you our pricing page?'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        for (const key in responses) {
            if (lowerMessage.includes(key)) return responses[key];
        }
        return "I'm not sure I understand. Could you rephrase that?";
    }

    function showLoadingSpinner() {
        $('#loadingSpinner').fadeIn();
    }

    function hideLoadingSpinner() {
        $('#loadingSpinner').fadeOut();
    }

    function showToast(message) {
        const toast = $(`
            <div class="toast-notification animate__animated animate__fadeInRight">
                <div class="toast-content">
                    <i class="fas fa-check-circle me-2"></i>
                    ${message}
                </div>
            </div>
        `);
        $('body').append(toast);
        setTimeout(() => {
            toast.addClass('animate__fadeOutRight');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    $('#getStartedBtn').click(() => $('html, body').animate({scrollTop: $('#features').offset().top}, 800));

    $('.chat-logo').click(function() {
        toggleChat();
    });

    $('.close-chat').click(function() {
        toggleChat();
    });

    $('.chat-header').click(function(e) {
        if (!$(e.target).hasClass('close-chat') && !$(e.target).parent().hasClass('close-chat')) {
            if ($('.chat-box').hasClass('minimized')) {
                maximizeChat();
            }
        }
    });

    $('#sendChatBtn').click(sendMessage);
    $('#chatInput').keypress(e => e.which === 13 && sendMessage());

    $('a[href*="#"]').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: $($(this).attr('href')).offset().top}, 800);
    });

    $(window).scroll(function() {
        $('.navbar').toggleClass('navbar-scrolled', $(this).scrollTop() > 100);
        const progress = ($(this).scrollTop() / ($(document).height() - $(window).height())) * 100;
        $('.progress-bar').css('width', progress + '%');
        
        // Animate elements on scroll
        $('.animate__animated').each(function() {
            const elementTop = $(this).offset().top;
            const elementBottom = elementTop + $(this).outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();
            
            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('animate__fadeIn');
            }
        });
    });

    // Close menu when clicking outside
    $(document).click(function(e) {
        if (!$(e.target).closest('.nav-menu-container').length) {
            $('.nav-dropdown').removeClass('show');
            $('.menu-toggle i').removeClass('fa-times').addClass('fa-bars');
        }
    });

    // Prevent menu from closing when clicking inside
    $('.nav-dropdown').click(function(e) {
        e.stopPropagation();
    });

    // Global loading handler
    function handlePageLoading(callback, delay = 800) {
        // Show loading modal
        const loadingModal = new bootstrap.Modal(document.getElementById('pageLoadingModal'));
        loadingModal.show();
        
        // Add loading class to body
        document.body.classList.add('loading');
        
        // Update loading message with random messages
        const loadingMessages = [
            "Preparing your experience",
            "Loading amazing features",
            "Almost there",
            "Setting up your workspace",
            "Gathering resources"
        ];
        
        const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
        $('.loading-message').text(randomMessage);
        
        // Execute callback after delay
        setTimeout(() => {
            if (callback) callback();
            hidePageLoading(loadingModal);
        }, delay);
        
        return loadingModal;
    }

    // Helper function to hide loading modal
    function hidePageLoading(modal) {
        if (modal) {
            modal.hide();
            
            // Remove loading class from body
            document.body.classList.remove('loading');
            
            // Add visible class to content for fade-in effect
            $('.page-transition').addClass('visible');
        }
    }

    // Navigation handling
    function handleNavigation() {
        // Handle same-page navigation
        $('a[href^="#"]').on('click', function(e) {
            e.preventDefault();
            const targetId = $(this).attr('href');
            const target = $(targetId);
            
            if (target.length) {
                handlePageLoading(() => {
                    // Scroll to target
                    $('html, body').animate({
                        scrollTop: target.offset().top - 70
                    }, 800, 'easeInOutExpo');
                    
                    // Update active state
                    $('.navbar-nav .nav-link').removeClass('active');
                    $(this).addClass('active');
                    
                    // Close mobile menu if open
                    $('.navbar-collapse').collapse('hide');
                });
            }
        });

        // Handle feature page navigation
        $('a[href^="features-"]').on('click', function(e) {
            e.preventDefault();
            const href = $(this).attr('href');
            
            handlePageLoading(() => {
                window.location.href = href;
            });
        });

        // Handle form submissions
        $('form').on('submit', function(e) {
            if (!$(this).hasClass('no-loading')) {
                handlePageLoading(null, 1500);
            }
        });

        // Handle buttons that aren't links
        $('.btn:not(a):not([type="submit"]):not([data-bs-toggle])').on('click', function() {
            if (!$(this).hasClass('no-loading')) {
                handlePageLoading(null, 1000);
            }
        });
    }

    // Initialize navigation
    handleNavigation();

    // Show loading for 2 seconds then load content
    handlePageLoading(() => {
        loadJSONData();
        setTimeout(toggleChat, 3000);
    }, 2000);

    // Check for stored scroll position on page load
    $(window).on('load', function() {
        const scrollToSection = sessionStorage.getItem('scrollToSection');
        if (scrollToSection) {
            sessionStorage.removeItem('scrollToSection');
            const targetElement = $('#' + scrollToSection);
            if (targetElement.length) {
                setTimeout(() => {
                    $('html, body').animate({
                        scrollTop: targetElement.offset().top - 70
                    }, 800, 'easeInOutExpo');
                }, 500);
            }
        }
        
        // Show content with fade-in effect
        $('.page-transition').addClass('visible');
    });

    // Add page transition class to main content
    $('main, section').addClass('page-transition');

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle mobile menu
    $('.navbar-toggler').on('click', function() {
        $(this).toggleClass('active');
    });

    // Close mobile menu on click outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.navbar').length) {
            $('.navbar-collapse').collapse('hide');
        }
    });

    // Add loading animation to buttons
    $('.btn').on('click', function() {
        const $this = $(this);
        $this.addClass('loading');
        setTimeout(() => $this.removeClass('loading'), 1000);
    });

    // Show chat logo after initial delay
    setTimeout(() => {
        if (!chatVisible) {
            $('.chat-logo').fadeIn(300);
        }
    }, 3000);
});