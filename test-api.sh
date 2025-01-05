#!/bin/bash

# Test Marketing Plans API
echo "Testing Marketing Plans API..."

# GET request to fetch plans
echo "\nFetching marketing plans..."
curl -X GET http://localhost:3001/api/marketing-plans \
  -H "Content-Type: application/json"

# POST request to create a plan
echo "\n\nCreating a new marketing plan..."
curl -X POST http://localhost:3001/api/marketing-plans \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "description": "A test business for API validation",
    "industry": "Technology",
    "targetAudience": "Small businesses and startups",
    "goals": "Increase online presence and lead generation",
    "budget": "5000",
    "challenges": "Limited brand awareness and high competition",
    "marketingChannels": "Social media, Content marketing, SEO",
    "additionalNotes": "Focus on B2B marketing"
  }'

# Test Subscriptions API
echo "\n\nTesting Subscriptions API..."

# GET request to fetch subscription
echo "\nFetching subscription..."
curl -X GET http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json"

# POST request to create subscription
echo "\n\nCreating a new subscription..."
curl -X POST http://localhost:3001/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "growth-pro"
  }' 