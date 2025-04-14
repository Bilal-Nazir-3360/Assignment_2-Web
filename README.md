# PlanPilot - Task Management System

![PlanPilot Demo](./Screenshot.jpeg) 

A modern task management web application with dynamic content loading, real-time statistics, and interactive features.

## Features

- **Responsive Design**: Works seamlessly on all device sizes
- **Dynamic Content Loading**: AJAX-powered features/reviews loading
- **Interactive Statistics**: Animated counter widgets with real-time updates
- **User Reviews System**: 
  - Submit and store reviews (persisted in localStorage)
  - Show more/less functionality
  - Star rating system
- **Contact Form**: Simulated message submission with loading states
- **Live Chat Support**: AI-powered chatbot with typing indicators
- **Modern UI Components**:
  - Animated navigation bar
  - Smooth scroll behavior
  - Toast notifications
  - Progress loader
  - Modals for login/signup
- **Data Persistence**: User reviews stored in localStorage

## Technologies Used

- **Frontend**: 
  - HTML5, CSS3 (Custom Properties)
  - JavaScript (ES6+)
  - jQuery 3.6.0
- **CSS Framework**: Bootstrap 5.3
- **Icons**: Font Awesome 6
- **Animations**: Animate.css
- **Fonts**: Poppins (Google Fonts)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/planpilot.git
   cd planpilot
   ```

2. Serve the application using a local server (required for AJAX):
   ```
   # Using Python (if installed)
   python -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Data Structure

### Features Data (`data/features.json`)
```
{
  "features": [
    {
      "icon": "fas fa-tasks",
      "title": "Task Organization",
      "description": "Easily categorize and prioritize tasks"
    }
  ]
}
```

### Reviews Data (`data/reviews.json`)
```
{
  "reviews": [
    {
      "name": "Sarah Johnson",
      "text": "Transformed my workflow!",
      "date": "2025-04-10",
      "rating": 5
    }
  ]
}
```

### Statistics Data (`data/stats.json`)
```
{
  "active_users": 25000,
  "tasks_completed": 980000,
  "hours_saved": 15000,
  "five_star_reviews": 4900
}
```

## Usage

1. **Navigation**:
   - Use the sticky navbar to jump between sections
   - Click "Get Started" to scroll to features
   - Use smooth scroll for section transitions

2. **Submitting Reviews**:
   - Fill out the review form in the Reviews section
   - Reviews persist across page reloads
   - Toggle between showing 4 reviews or all reviews

3. **Contact Form**:
   - Submit messages (simulated with 1.5s delay)
   - Receive toast notifications on success

4. **Live Chat**:
   - Click the chat bubble in bottom-right
   - Try these commands:
     - "features" - List features
     - "contact" - Get contact info
     - "price" - Pricing inquiry
     - "bye" - End conversation

## Key Components

- **Animated Elements**:
  - Feature cards fade in with staggered delays
  - Review cards have entrance animations
  - Stats counters animate on scroll

- **Interactive Features**:
  - Hover effects on all cards/buttons
  - Scroll progress indicator
  - Loading spinner for AJAX operations
  - Responsive navbar with scroll effect

## Custom CSS Variables

```
:root {
  --teal: #2dd4bf;
  --yellow: #ffcc00;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch:
   ```
   git checkout -b feature/new-feature
   ```
3. Commit your changes
4. Push to the branch
5. Open a pull request

