$(document).ready(function() {
    let chatVisible = false;
    const chatBox = $('.chat-box');
    let allReviews = [];
    let remainingReviews = [];

    setTimeout(() => {
        $('#notificationModal').modal('show');
    }, 1500);

    function loadJSONData() {
        showLoadingSpinner();
        
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

        $.ajax({
            url: 'data/stats.json',
            dataType: 'json',
            success: function(data) {
                renderStats(data);
            },
            error: function(xhr, status, error) {
                console.error("Error loading stats:", error);
            }
        });
    }

    function renderFeatures(features) {
        const container = $('#featuresContainer');
        container.empty();
        features.forEach((feature, index) => {
            const delay = index * 0.2;
            const featureHtml = `
                <div class="col-md-4 mb-4">
                    <div class="card feature-card animate__animated animate__fadeInUp" style="animation-delay: ${delay}s">
                        <div class="card-body">
                            <i class="${feature.icon} fa-3x mb-3"></i>
                            <h5 class="card-title">${feature.title}</h5>
                            <p class="card-text">${feature.description}</p>
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
        Object.keys(stats).forEach((key, index) => {
            const delay = index * 0.3;
            const statHtml = `
                <div class="col-md-3 text-center animate__animated animate__fadeIn" style="animation-delay: ${delay}s">
                    <div class="stat-box p-3">
                        <h3 class="stat-value" data-count="${stats[key]}">0</h3>
                        <p class="stat-label">${key.replace(/_/g, ' ')}</p>
                    </div>
                </div>
            `;
            container.append(statHtml);
        });

        $('.stat-value').each(function() {
            const $this = $(this);
            const target = parseInt($this.attr('data-count'));
            $({ count: 0 }).animate({ count: target }, {
                duration: 2000,
                easing: 'swing',
                step: function() { $this.text(Math.floor(this.count)); }
            });
        });
    }

    $('#reviewForm').submit(function(e) {
        e.preventDefault();
        const name = $('#reviewName').val();
        const text = $('#reviewText').val();
        
        if (name && text) {
            const newReview = {
                name: name,
                text: text,
                rating: 5,
                date: new Date().toISOString()
            };

            const userReviews = JSON.parse(localStorage.getItem('userReviews')) || [];
            userReviews.push(newReview);
            localStorage.setItem('userReviews', JSON.stringify(userReviews));
            
            allReviews.unshift(newReview);
            renderReviews();
            
            $('#reviewName').val('');
            $('#reviewText').val('');
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
        chatBox.animate({ bottom: chatVisible ? '20px' : '-300px' }, 300);
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
            }, 1000);
        }
    }

    function appendMessage(sender, message) {
        const chatBody = $('.chat-body');
        const messageElement = $(`
            <div class="chat-message ${sender} animate__animated animate__fadeIn">
                <div class="message-content">
                    <span class="avatar">${sender === 'user' ? '👤' : '🤖'}</span>
                    <div class="text">${message}</div>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        `);
        chatBody.append(messageElement);
        chatBody.scrollTop(chatBody[0].scrollHeight);
    }

    function showTypingIndicator() {
        const typingIndicator = $('<div class="typing-indicator">🤖 Agent is typing...</div>');
        $('.chat-body').append(typingIndicator).scrollTop(chatBody[0].scrollHeight);
    }

    function hideTypingIndicator() {
        $('.typing-indicator').remove();
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

    $('.chat-header').click(function(e) {
        if (!$(e.target).hasClass('close-chat') && !$(e.target).parent().hasClass('close-chat')) toggleChat();
    });

    $('.close-chat').click(toggleChat);
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
    });

    loadJSONData();
    setTimeout(toggleChat, 3000);
});