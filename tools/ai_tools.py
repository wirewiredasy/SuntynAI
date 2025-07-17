import os
import logging
from flask import request
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from nltk.probability import FreqDist
import heapq
import re
import random

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

def process_text_summarizer(request):
    """Process text summarizer tool"""
    try:
        text = request.form.get('text', '')
        summary_length = int(request.form.get('summary_length', 3))
        
        if not text:
            return {'error': 'Text is required'}
        
        if len(text.split()) < 10:
            return {'error': 'Text must contain at least 10 words'}
        
        # Tokenize into sentences
        sentences = sent_tokenize(text)
        
        if len(sentences) < summary_length:
            summary_length = len(sentences)
        
        # Tokenize into words and remove stopwords
        words = word_tokenize(text.lower())
        stop_words = set(stopwords.words('english'))
        words = [word for word in words if word.isalnum() and word not in stop_words]
        
        # Calculate word frequencies
        word_freq = FreqDist(words)
        
        # Score sentences based on word frequencies
        sentence_scores = {}
        for sentence in sentences:
            words_in_sentence = word_tokenize(sentence.lower())
            score = 0
            word_count = 0
            
            for word in words_in_sentence:
                if word in word_freq:
                    score += word_freq[word]
                    word_count += 1
            
            if word_count > 0:
                sentence_scores[sentence] = score / word_count
        
        # Get top sentences
        top_sentences = heapq.nlargest(summary_length, sentence_scores, key=sentence_scores.get)
        
        # Maintain original order
        summary = []
        for sentence in sentences:
            if sentence in top_sentences:
                summary.append(sentence)
        
        summary_text = ' '.join(summary)
        
        # Generate key points
        key_points = []
        for sentence in top_sentences[:5]:  # Top 5 sentences as key points
            # Clean up sentence
            clean_sentence = re.sub(r'[^\w\s]', '', sentence)
            if len(clean_sentence.split()) > 3:  # Only add meaningful sentences
                key_points.append('• ' + sentence.strip())
        
        # Calculate stats
        original_words = len(text.split())
        summary_words = len(summary_text.split())
        compression_ratio = round((1 - summary_words / original_words) * 100, 1)
        
        return {
            'success': True,
            'summary': summary_text,
            'key_points': key_points,
            'stats': {
                'original_words': original_words,
                'summary_words': summary_words,
                'compression_ratio': compression_ratio,
                'original_sentences': len(sentences),
                'summary_sentences': len(summary)
            }
        }
            if len(clean_sentence) > 20:
                key_points.append(clean_sentence[:100] + '...' if len(clean_sentence) > 100 else clean_sentence)
        
        return {
            'success': True,
            'results': {
                'original_text': text,
                'summary': summary_text,
                'key_points': key_points,
                'original_length': len(text.split()),
                'summary_length': len(summary_text.split()),
                'compression_ratio': round((1 - len(summary_text.split()) / len(text.split())) * 100, 2)
            }
        }
    
    except Exception as e:
        logging.error(f"Text summarizer error: {str(e)}")
        return {'error': 'Failed to summarize text'}

def process_business_name_generator(request):
    """Process business name generator tool"""
    try:
        industry = request.form.get('industry', '')
        keywords = request.form.get('keywords', '')
        style = request.form.get('style', 'professional')
        
        if not industry:
            return {'error': 'Industry is required'}
        
        # Predefined word lists
        professional_words = ['Pro', 'Elite', 'Prime', 'Apex', 'Core', 'Peak', 'Max', 'Ultra', 'Super', 'Grand']
        creative_words = ['Creative', 'Design', 'Studio', 'Lab', 'Works', 'Craft', 'Art', 'Vision', 'Dream', 'Spark']
        tech_words = ['Tech', 'Digital', 'Cyber', 'Net', 'Web', 'Cloud', 'Data', 'Smart', 'AI', 'Byte']
        
        # Industry-specific suffixes
        industry_suffixes = {
            'technology': ['Tech', 'Systems', 'Solutions', 'Labs', 'Digital'],
            'consulting': ['Consulting', 'Advisors', 'Partners', 'Group', 'Associates'],
            'retail': ['Store', 'Shop', 'Market', 'Outlet', 'Emporium'],
            'food': ['Kitchen', 'Cafe', 'Bistro', 'Restaurant', 'Eatery'],
            'healthcare': ['Health', 'Care', 'Medical', 'Wellness', 'Clinic'],
            'finance': ['Finance', 'Capital', 'Investments', 'Financial', 'Bank'],
            'education': ['Academy', 'Institute', 'School', 'Learning', 'Education'],
            'real_estate': ['Properties', 'Realty', 'Real Estate', 'Homes', 'Estates']
        }
        
        # Generate names
        names = []
        keyword_list = [k.strip() for k in keywords.split(',') if k.strip()] if keywords else []
        
        # Choose word list based on style
        if style == 'professional':
            prefix_words = professional_words
        elif style == 'creative':
            prefix_words = creative_words
        elif style == 'tech':
            prefix_words = tech_words
        else:
            prefix_words = professional_words
        
        # Get industry suffixes
        suffixes = industry_suffixes.get(industry.lower(), ['Co', 'Inc', 'LLC', 'Group', 'Solutions'])
        
        # Generate combinations
        for _ in range(20):
            if keyword_list and random.choice([True, False]):
                # Use keywords
                keyword = random.choice(keyword_list)
                if random.choice([True, False]):
                    name = f"{keyword} {random.choice(suffixes)}"
                else:
                    name = f"{random.choice(prefix_words)} {keyword}"
            else:
                # Use prefix + suffix
                name = f"{random.choice(prefix_words)} {random.choice(suffixes)}"
            
            names.append(name)
        
        # Remove duplicates and sort
        names = sorted(list(set(names)))
        
        return {
            'success': True,
            'results': {
                'industry': industry,
                'keywords': keywords,
                'style': style,
                'names': names[:15],  # Return top 15 names
                'total_generated': len(names)
            }
        }
    
    except Exception as e:
        logging.error(f"Business name generator error: {str(e)}")
        return {'error': 'Failed to generate business names'}

def process_blog_title_generator(request):
    """Process blog title generator tool"""
    try:
        topic = request.form.get('topic', '')
        keywords = request.form.get('keywords', '')
        tone = request.form.get('tone', 'professional')
        
        if not topic:
            return {'error': 'Topic is required'}
        
        # Title templates by tone
        templates = {
            'professional': [
                "The Complete Guide to {topic}",
                "How to Master {topic}: A Professional's Guide",
                "Understanding {topic}: Best Practices and Tips",
                "{topic}: Essential Strategies for Success",
                "The Ultimate {topic} Handbook",
                "Professional Insights into {topic}",
                "Advanced {topic} Techniques That Work",
                "The Science Behind {topic}",
                "Why {topic} Matters in Today's World",
                "Expert Tips for {topic} Success"
            ],
            'casual': [
                "Everything You Need to Know About {topic}",
                "The Fun Guide to {topic}",
                "Let's Talk About {topic}",
                "Simple Ways to Get Better at {topic}",
                "Why I Love {topic} (And You Should Too)",
                "The Beginner's Guide to {topic}",
                "Getting Started with {topic}",
                "My Experience with {topic}",
                "What I Learned About {topic}",
                "The Easy Way to Understand {topic}"
            ],
            'exciting': [
                "The Amazing World of {topic}",
                "Discover the Secrets of {topic}",
                "Unlock the Power of {topic}",
                "The Revolutionary Guide to {topic}",
                "Transform Your Life with {topic}",
                "The Incredible Benefits of {topic}",
                "Mind-Blowing {topic} Facts",
                "The Future of {topic} is Here",
                "Breakthrough Strategies for {topic}",
                "The Game-Changing Guide to {topic}"
            ]
        }
        
        # Generate titles
        titles = []
        template_list = templates.get(tone, templates['professional'])
        
        # Use topic in templates
        for template in template_list:
            title = template.format(topic=topic)
            titles.append(title)
        
        # Add keyword variations if provided
        if keywords:
            keyword_list = [k.strip() for k in keywords.split(',') if k.strip()]
            for keyword in keyword_list[:3]:  # Use first 3 keywords
                for template in template_list[:5]:  # Use first 5 templates
                    title = template.format(topic=f"{topic} {keyword}")
                    titles.append(title)
        
        # Remove duplicates and limit
        titles = list(set(titles))[:20]
        
        return {
            'success': True,
            'results': {
                'topic': topic,
                'keywords': keywords,
                'tone': tone,
                'titles': titles,
                'total_generated': len(titles)
            }
        }
    
    except Exception as e:
        logging.error(f"Blog title generator error: {str(e)}")
        return {'error': 'Failed to generate blog titles'}

def process_product_description(request):
    """Process product description generator tool"""
    try:
        product_name = request.form.get('product_name', '')
        features = request.form.get('features', '')
        benefits = request.form.get('benefits', '')
        target_audience = request.form.get('target_audience', '')
        tone = request.form.get('tone', 'professional')
        
        if not product_name:
            return {'error': 'Product name is required'}
        
        # Create description based on tone
        if tone == 'professional':
            description = f"Introducing {product_name}, a premium solution designed to meet your needs. "
        elif tone == 'casual':
            description = f"Meet {product_name} - your new favorite product! "
        elif tone == 'exciting':
            description = f"Get ready to experience {product_name} - the revolutionary product that changes everything! "
        else:
            description = f"Discover {product_name}, the perfect choice for your requirements. "
        
        # Add features
        if features:
            feature_list = [f.strip() for f in features.split(',') if f.strip()]
            if feature_list:
                description += f"Key features include: {', '.join(feature_list)}. "
        
        # Add benefits
        if benefits:
            benefit_list = [b.strip() for b in benefits.split(',') if b.strip()]
            if benefit_list:
                description += f"You'll enjoy benefits such as: {', '.join(benefit_list)}. "
        
        # Add target audience
        if target_audience:
            description += f"Perfect for {target_audience}. "
        
        # Add call to action
        if tone == 'professional':
            description += "Order now to experience the difference."
        elif tone == 'casual':
            description += "Don't wait - get yours today!"
        elif tone == 'exciting':
            description += "Act now and transform your experience!"
        else:
            description += "Make your purchase today."
        
        # Generate short version
        short_description = f"{product_name} - "
        if features:
            feature_list = [f.strip() for f in features.split(',') if f.strip()]
            if feature_list:
                short_description += f"{feature_list[0]}. "
        if benefits:
            benefit_list = [b.strip() for b in benefits.split(',') if b.strip()]
            if benefit_list:
                short_description += f"{benefit_list[0]}."
        
        return {
            'success': True,
            'results': {
                'product_name': product_name,
                'long_description': description,
                'short_description': short_description,
                'tone': tone,
                'word_count': len(description.split()),
                'char_count': len(description)
            }
        }
    
    except Exception as e:
        logging.error(f"Product description error: {str(e)}")
        return {'error': 'Failed to generate product description'}
