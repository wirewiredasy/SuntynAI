import io
import logging

try:
    from pydub import AudioSegment
    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Professional audio processing utilities"""
    
    @staticmethod
    def convert_format(audio_file, input_format, output_format):
        """Convert audio between formats"""
        if not PYDUB_AVAILABLE:
            raise ImportError("PyDub is required for audio processing")
        try:
            audio_file.seek(0)
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
            
            output = io.BytesIO()
            audio.export(output, format=output_format)
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio format conversion error: {e}")
            raise
    
    @staticmethod
    def change_speed(audio_file, speed_factor, input_format='mp3'):
        """Change audio playback speed"""
        try:
            audio_file.seek(0)
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
            
            # Change speed
            faster_audio = audio.speedup(playback_speed=speed_factor)
            
            output = io.BytesIO()
            faster_audio.export(output, format="mp3")
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio speed change error: {e}")
            raise
    
    @staticmethod
    def adjust_volume(audio_file, volume_change_db, input_format='mp3'):
        """Adjust audio volume"""
        try:
            audio_file.seek(0)
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
            
            # Adjust volume
            louder_audio = audio + volume_change_db
            
            output = io.BytesIO()
            louder_audio.export(output, format="mp3")
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio volume adjustment error: {e}")
            raise
    
    @staticmethod
    def trim_audio(audio_file, start_time, end_time, input_format='mp3'):
        """Trim audio to specified time range"""
        try:
            audio_file.seek(0)
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
            
            # Convert time to milliseconds
            start_ms = start_time * 1000
            end_ms = end_time * 1000
            
            # Trim audio
            trimmed_audio = audio[start_ms:end_ms]
            
            output = io.BytesIO()
            trimmed_audio.export(output, format="mp3")
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio trimming error: {e}")
            raise
    
    @staticmethod
    def merge_audio(audio_files, input_format='mp3'):
        """Merge multiple audio files"""
        try:
            combined = AudioSegment.empty()
            
            for audio_file in audio_files:
                audio_file.seek(0)
                audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
                combined += audio
            
            output = io.BytesIO()
            combined.export(output, format="mp3")
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio merging error: {e}")
            raise
    
    @staticmethod
    def normalize_audio(audio_file, input_format='mp3'):
        """Normalize audio levels"""
        try:
            audio_file.seek(0)
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
            
            # Normalize to -20dBFS
            normalized_audio = audio.normalize()
            
            output = io.BytesIO()
            normalized_audio.export(output, format="mp3")
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio normalization error: {e}")
            raise
    
    @staticmethod
    def add_fade(audio_file, fade_in_duration=1000, fade_out_duration=1000, input_format='mp3'):
        """Add fade in/out effects"""
        try:
            audio_file.seek(0)
            audio = AudioSegment.from_file(io.BytesIO(audio_file.read()), format=input_format)
            
            # Add fade effects
            faded_audio = audio.fade_in(fade_in_duration).fade_out(fade_out_duration)
            
            output = io.BytesIO()
            faded_audio.export(output, format="mp3")
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio fade error: {e}")
            raise