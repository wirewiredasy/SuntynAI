"""
Student Tools Implementation - All 11 student tools
High-priority implementation for Indian students
"""
import os
import tempfile
import logging
from datetime import datetime, timedelta
import json
import random
import string

logger = logging.getLogger(__name__)

class StudentTools:
    """Complete student tool implementations"""
    
    def __init__(self):
        self.temp_dir = tempfile.gettempdir()
    
    def gpa_calculator(self, files, form_data):
        """Calculate GPA from grades and credits"""
        try:
            # Get grades and credits from form data
            grades_input = form_data.get('grades', '')
            credits_input = form_data.get('credits', '')
            scale = form_data.get('scale', '4.0')
            
            if not grades_input or not credits_input:
                return {
                    'success': False,
                    'error': 'Please provide grades and credits'
                }
            
            # Parse grades and credits
            grades = [float(g.strip()) for g in grades_input.split(',') if g.strip()]
            credits = [float(c.strip()) for c in credits_input.split(',') if c.strip()]
            
            if len(grades) != len(credits):
                return {
                    'success': False,
                    'error': 'Number of grades must match number of credits'
                }
            
            # Calculate GPA
            total_points = sum(grade * credit for grade, credit in zip(grades, credits))
            total_credits = sum(credits)
            
            if total_credits == 0:
                return {
                    'success': False,
                    'error': 'Total credits cannot be zero'
                }
            
            gpa = total_points / total_credits
            
            # Generate detailed breakdown
            breakdown = []
            for i, (grade, credit) in enumerate(zip(grades, credits)):
                breakdown.append({
                    'subject': f'Subject {i+1}',
                    'grade': grade,
                    'credits': credit,
                    'points': grade * credit
                })
            
            # Grade classification
            if gpa >= 3.7:
                classification = "Excellent (A+)"
            elif gpa >= 3.3:
                classification = "Very Good (A)"
            elif gpa >= 3.0:
                classification = "Good (B+)"
            elif gpa >= 2.7:
                classification = "Average (B)"
            elif gpa >= 2.0:
                classification = "Below Average (C)"
            else:
                classification = "Poor (D/F)"
            
            return {
                'success': True,
                'gpa': round(gpa, 2),
                'total_credits': total_credits,
                'total_points': round(total_points, 2),
                'classification': classification,
                'breakdown': breakdown,
                'message': f'Your GPA is {gpa:.2f} out of {scale} - {classification}'
            }
            
        except ValueError:
            return {
                'success': False,
                'error': 'Invalid grade or credit values. Please use numbers only.'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'GPA calculation failed: {str(e)}'
            }
    
    def assignment_planner(self, files, form_data):
        """Create assignment schedule and deadlines"""
        try:
            assignment_name = form_data.get('assignment_name', '')
            due_date = form_data.get('due_date', '')
            complexity = form_data.get('complexity', 'medium')
            subject = form_data.get('subject', '')
            
            if not assignment_name or not due_date:
                return {
                    'success': False,
                    'error': 'Assignment name and due date are required'
                }
            
            # Parse due date
            due_date_obj = datetime.strptime(due_date, '%Y-%m-%d')
            today = datetime.now()
            days_left = (due_date_obj - today).days
            
            if days_left < 0:
                return {
                    'success': False,
                    'error': 'Due date has already passed'
                }
            
            # Generate schedule based on complexity
            complexity_days = {
                'easy': 3,
                'medium': 7,
                'hard': 14,
                'very_hard': 21
            }
            
            recommended_days = complexity_days.get(complexity, 7)
            
            # Create timeline
            milestones = []
            if days_left >= recommended_days:
                # Research phase
                research_date = today + timedelta(days=max(1, days_left // 4))
                milestones.append({
                    'phase': 'Research & Planning',
                    'date': research_date.strftime('%Y-%m-%d'),
                    'tasks': ['Gather sources', 'Create outline', 'Set objectives']
                })
                
                # Draft phase
                draft_date = today + timedelta(days=max(2, days_left // 2))
                milestones.append({
                    'phase': 'First Draft',
                    'date': draft_date.strftime('%Y-%m-%d'),
                    'tasks': ['Write introduction', 'Develop main content', 'Add references']
                })
                
                # Review phase
                review_date = today + timedelta(days=max(3, (days_left * 3) // 4))
                milestones.append({
                    'phase': 'Review & Edit',
                    'date': review_date.strftime('%Y-%m-%d'),
                    'tasks': ['Proofread content', 'Check formatting', 'Verify citations']
                })
                
                # Final phase
                final_date = due_date_obj - timedelta(days=1)
                milestones.append({
                    'phase': 'Final Submission',
                    'date': final_date.strftime('%Y-%m-%d'),
                    'tasks': ['Final review', 'Format document', 'Submit assignment']
                })
            else:
                # Compressed schedule for tight deadlines
                milestones.append({
                    'phase': 'Immediate Action',
                    'date': today.strftime('%Y-%m-%d'),
                    'tasks': ['Start immediately', 'Focus on core content', 'Skip non-essentials']
                })
                
                if days_left > 1:
                    milestones.append({
                        'phase': 'Complete & Submit',
                        'date': (due_date_obj - timedelta(days=1)).strftime('%Y-%m-%d'),
                        'tasks': ['Finalize content', 'Quick review', 'Prepare for submission']
                    })
            
            # Tips based on subject
            subject_tips = {
                'mathematics': ['Show all working steps', 'Double-check calculations', 'Use proper notation'],
                'science': ['Include diagrams', 'Cite recent studies', 'Explain methodology'],
                'history': ['Use primary sources', 'Provide context', 'Support with evidence'],
                'literature': ['Analyze themes', 'Quote effectively', 'Develop arguments'],
                'default': ['Stay organized', 'Manage time well', 'Seek help if needed']
            }
            
            tips = subject_tips.get(subject.lower(), subject_tips['default'])
            
            return {
                'success': True,
                'assignment': assignment_name,
                'subject': subject,
                'due_date': due_date,
                'days_remaining': days_left,
                'recommended_start_days': recommended_days,
                'urgency_level': 'High' if days_left < 3 else 'Medium' if days_left < 7 else 'Low',
                'milestones': milestones,
                'tips': tips,
                'message': f'Assignment plan created for "{assignment_name}" - {days_left} days remaining'
            }
            
        except ValueError:
            return {
                'success': False,
                'error': 'Invalid date format. Please use YYYY-MM-DD'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Assignment planning failed: {str(e)}'
            }
    
    def citation_generator(self, files, form_data):
        """Generate academic citations in multiple formats"""
        try:
            citation_type = form_data.get('type', 'book')
            title = form_data.get('title', '')
            author = form_data.get('author', '')
            year = form_data.get('year', '')
            
            if not title or not author:
                return {
                    'success': False,
                    'error': 'Title and author are required'
                }
            
            # Generate citations in multiple formats
            citations = {}
            
            if citation_type == 'book':
                publisher = form_data.get('publisher', '')
                city = form_data.get('city', '')
                
                # APA Format
                citations['APA'] = f"{author} ({year}). {title}. {publisher}."
                if city:
                    citations['APA'] = f"{author} ({year}). {title}. {city}: {publisher}."
                
                # MLA Format
                citations['MLA'] = f"{author}. {title}. {publisher}, {year}."
                
                # Chicago Format
                citations['Chicago'] = f"{author}. {title}. {city}: {publisher}, {year}."
                
            elif citation_type == 'journal':
                journal = form_data.get('journal', '')
                volume = form_data.get('volume', '')
                pages = form_data.get('pages', '')
                
                # APA Format
                citations['APA'] = f"{author} ({year}). {title}. {journal}, {volume}, {pages}."
                
                # MLA Format
                citations['MLA'] = f"{author}. \"{title}.\" {journal}, vol. {volume}, {year}, pp. {pages}."
                
                # Chicago Format
                citations['Chicago'] = f"{author}. \"{title}.\" {journal} {volume} ({year}): {pages}."
                
            elif citation_type == 'website':
                url = form_data.get('url', '')
                access_date = form_data.get('access_date', datetime.now().strftime('%Y-%m-%d'))
                
                # APA Format
                citations['APA'] = f"{author} ({year}). {title}. Retrieved from {url}"
                
                # MLA Format
                citations['MLA'] = f"{author}. \"{title}.\" Web. {access_date}."
                
                # Chicago Format
                citations['Chicago'] = f"{author}. \"{title}.\" Accessed {access_date}. {url}."
            
            return {
                'success': True,
                'citations': citations,
                'source_type': citation_type,
                'title': title,
                'author': author,
                'year': year,
                'message': f'Citations generated for "{title}" by {author}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Citation generation failed: {str(e)}'
            }
    
    def study_schedule(self, files, form_data):
        """Create personalized study schedule"""
        try:
            subjects = form_data.get('subjects', '').split(',')
            daily_hours = int(form_data.get('daily_hours', 4))
            exam_dates = form_data.get('exam_dates', '')
            study_style = form_data.get('study_style', 'balanced')
            
            if not subjects or not subjects[0].strip():
                return {
                    'success': False,
                    'error': 'Please provide at least one subject'
                }
            
            subjects = [s.strip() for s in subjects if s.strip()]
            
            # Parse exam dates if provided
            exam_schedule = {}
            if exam_dates:
                try:
                    for exam in exam_dates.split(','):
                        if ':' in exam:
                            subject, date = exam.split(':', 1)
                            exam_schedule[subject.strip()] = datetime.strptime(date.strip(), '%Y-%m-%d')
                except:
                    pass
            
            # Generate weekly schedule
            days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            weekly_schedule = {}
            
            # Study style configurations
            style_configs = {
                'intensive': {'morning': 0.4, 'afternoon': 0.4, 'evening': 0.2},
                'balanced': {'morning': 0.3, 'afternoon': 0.3, 'evening': 0.4},
                'evening': {'morning': 0.2, 'afternoon': 0.3, 'evening': 0.5}
            }
            
            config = style_configs.get(study_style, style_configs['balanced'])
            
            # Distribute subjects across days
            for day in days:
                daily_schedule = []
                remaining_hours = daily_hours
                
                # Morning session
                morning_hours = remaining_hours * config['morning']
                if morning_hours >= 1:
                    subject = subjects[days.index(day) % len(subjects)]
                    daily_schedule.append({
                        'time': '09:00-11:00',
                        'subject': subject,
                        'duration': f"{morning_hours:.1f} hours",
                        'type': 'Deep Focus'
                    })
                
                # Afternoon session
                afternoon_hours = remaining_hours * config['afternoon']
                if afternoon_hours >= 1:
                    subject = subjects[(days.index(day) + 1) % len(subjects)]
                    daily_schedule.append({
                        'time': '14:00-16:00',
                        'subject': subject,
                        'duration': f"{afternoon_hours:.1f} hours",
                        'type': 'Active Learning'
                    })
                
                # Evening session
                evening_hours = remaining_hours * config['evening']
                if evening_hours >= 1:
                    subject = subjects[(days.index(day) + 2) % len(subjects)]
                    daily_schedule.append({
                        'time': '19:00-21:00',
                        'subject': subject,
                        'duration': f"{evening_hours:.1f} hours",
                        'type': 'Review & Practice'
                    })
                
                weekly_schedule[day] = daily_schedule
            
            # Study tips based on style
            style_tips = {
                'intensive': [
                    'Take regular 10-minute breaks',
                    'Stay hydrated during long sessions',
                    'Use active recall techniques'
                ],
                'balanced': [
                    'Maintain consistent daily routine',
                    'Mix different learning methods',
                    'Review previous day content'
                ],
                'evening': [
                    'Ensure good lighting for evening study',
                    'Avoid heavy meals before studying',
                    'Create quiet environment'
                ]
            }
            
            return {
                'success': True,
                'weekly_schedule': weekly_schedule,
                'total_daily_hours': daily_hours,
                'study_style': study_style,
                'subjects': subjects,
                'exam_schedule': {k: v.strftime('%Y-%m-%d') for k, v in exam_schedule.items()},
                'tips': style_tips.get(study_style, style_tips['balanced']),
                'message': f'Study schedule created for {len(subjects)} subjects with {daily_hours} hours daily'
            }
            
        except ValueError:
            return {
                'success': False,
                'error': 'Invalid input. Please check daily hours and exam dates format.'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Study schedule creation failed: {str(e)}'
            }
    
    def research_helper(self, files, form_data):
        """Help with research methodology and sources"""
        try:
            topic = form_data.get('topic', '')
            research_type = form_data.get('research_type', 'academic')
            level = form_data.get('level', 'undergraduate')
            
            if not topic:
                return {
                    'success': False,
                    'error': 'Research topic is required'
                }
            
            # Generate research framework
            research_steps = [
                {
                    'step': 1,
                    'title': 'Define Research Question',
                    'tasks': [
                        'Narrow down your topic',
                        'Formulate specific research questions',
                        'Identify key concepts and terms'
                    ]
                },
                {
                    'step': 2,
                    'title': 'Literature Review',
                    'tasks': [
                        'Search academic databases',
                        'Review recent publications (last 5 years)',
                        'Identify research gaps'
                    ]
                },
                {
                    'step': 3,
                    'title': 'Research Design',
                    'tasks': [
                        'Choose appropriate methodology',
                        'Select data collection methods',
                        'Plan analysis approach'
                    ]
                },
                {
                    'step': 4,
                    'title': 'Data Collection',
                    'tasks': [
                        'Gather primary/secondary data',
                        'Document sources properly',
                        'Maintain research ethics'
                    ]
                },
                {
                    'step': 5,
                    'title': 'Analysis & Conclusion',
                    'tasks': [
                        'Analyze collected data',
                        'Draw evidence-based conclusions',
                        'Suggest future research directions'
                    ]
                }
            ]
            
            # Suggest databases and sources
            academic_sources = [
                'Google Scholar',
                'JSTOR',
                'PubMed (for medical/science)',
                'IEEE Xplore (for engineering)',
                'RePEc (for economics)',
                'SAGE Journals',
                'SpringerLink',
                'ScienceDirect'
            ]
            
            indian_sources = [
                'Shodhganga (Indian ETDs)',
                'IndMED (Indian medical journals)',
                'J-Gate (Indian journals)',
                'NISCAIR (CSIR publications)',
                'DSpace@IITD (IIT Delhi)',
                'Indian Citation Index'
            ]
            
            # Generate keywords
            keywords = topic.split()
            related_keywords = []
            for word in keywords:
                if len(word) > 3:
                    related_keywords.extend([
                        f"{word} analysis",
                        f"{word} methodology",
                        f"{word} framework",
                        f"{word} impact"
                    ])
            
            # Research timeline based on level
            timeline_weeks = {
                'undergraduate': 8,
                'postgraduate': 16,
                'doctoral': 52
            }
            
            weeks = timeline_weeks.get(level, 8)
            
            return {
                'success': True,
                'topic': topic,
                'research_type': research_type,
                'level': level,
                'research_steps': research_steps,
                'academic_sources': academic_sources,
                'indian_sources': indian_sources,
                'suggested_keywords': related_keywords[:10],
                'estimated_timeline': f"{weeks} weeks",
                'methodology_tips': [
                    'Start with secondary research',
                    'Use mixed methods if appropriate',
                    'Consider ethical implications',
                    'Maintain detailed research log'
                ],
                'message': f'Research framework created for "{topic}" at {level} level'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Research helper failed: {str(e)}'
            }