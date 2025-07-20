import io
import os
import tempfile
import logging

try:
    from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False

logger = logging.getLogger(__name__)

class VideoProcessor:
    """Professional video processing utilities"""
    
    @staticmethod
    def extract_audio(video_file):
        """Extract audio from video file"""
        if not MOVIEPY_AVAILABLE:
            raise ImportError("MoviePy is required for video processing")
        try:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
                tmp_video.write(video_file.read())
                tmp_video_path = tmp_video.name
            
            # Extract audio
            video = VideoFileClip(tmp_video_path)
            audio = video.audio
            
            # Save to temporary file
            audio_path = tmp_video_path.replace('.mp4', '.mp3')
            audio.write_audiofile(audio_path, verbose=False, logger=None)
            
            # Read audio file
            output = io.BytesIO()
            with open(audio_path, 'rb') as f:
                output.write(f.read())
            
            # Cleanup
            video.close()
            audio.close()
            os.unlink(tmp_video_path)
            os.unlink(audio_path)
            
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Audio extraction error: {e}")
            raise
    
    @staticmethod
    def convert_format(video_file, output_format, quality='medium'):
        """Convert video to different format"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
                tmp_video.write(video_file.read())
                tmp_video_path = tmp_video.name
            
            video = VideoFileClip(tmp_video_path)
            output_path = tmp_video_path.replace('.mp4', f'.{output_format}')
            
            # Set quality parameters
            if quality == 'high':
                bitrate = '2000k'
            elif quality == 'low':
                bitrate = '500k'
            else:  # medium
                bitrate = '1000k'
            
            if output_format == 'gif':
                video.write_gif(output_path, fps=10)
            elif output_format == 'mp4':
                video.write_videofile(output_path, bitrate=bitrate, verbose=False, logger=None)
            elif output_format == 'avi':
                video.write_videofile(output_path, codec='libx264', bitrate=bitrate, verbose=False, logger=None)
            elif output_format == 'mov':
                video.write_videofile(output_path, codec='libx264', bitrate=bitrate, verbose=False, logger=None)
            
            # Read converted file
            output = io.BytesIO()
            with open(output_path, 'rb') as f:
                output.write(f.read())
            
            # Cleanup
            video.close()
            os.unlink(tmp_video_path)
            os.unlink(output_path)
            
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Video conversion error: {e}")
            raise
    
    @staticmethod
    def compress_video(video_file, compression_ratio=0.5):
        """Compress video file"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
                tmp_video.write(video_file.read())
                tmp_video_path = tmp_video.name
            
            video = VideoFileClip(tmp_video_path)
            
            # Resize for compression
            new_width = int(video.w * compression_ratio)
            new_height = int(video.h * compression_ratio)
            
            compressed_video = video.resize((new_width, new_height))
            
            output_path = tmp_video_path.replace('.mp4', '_compressed.mp4')
            compressed_video.write_videofile(
                output_path, 
                bitrate='800k', 
                verbose=False, 
                logger=None
            )
            
            # Read compressed file
            output = io.BytesIO()
            with open(output_path, 'rb') as f:
                output.write(f.read())
            
            # Cleanup
            video.close()
            compressed_video.close()
            os.unlink(tmp_video_path)
            os.unlink(output_path)
            
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Video compression error: {e}")
            raise
    
    @staticmethod
    def trim_video(video_file, start_time, end_time):
        """Trim video to specified time range"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
                tmp_video.write(video_file.read())
                tmp_video_path = tmp_video.name
            
            video = VideoFileClip(tmp_video_path)
            trimmed_video = video.subclip(start_time, end_time)
            
            output_path = tmp_video_path.replace('.mp4', '_trimmed.mp4')
            trimmed_video.write_videofile(output_path, verbose=False, logger=None)
            
            # Read trimmed file
            output = io.BytesIO()
            with open(output_path, 'rb') as f:
                output.write(f.read())
            
            # Cleanup
            video.close()
            trimmed_video.close()
            os.unlink(tmp_video_path)
            os.unlink(output_path)
            
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"Video trimming error: {e}")
            raise
    
    @staticmethod
    def create_gif(video_file, fps=10, duration=None):
        """Convert video to GIF"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_video:
                tmp_video.write(video_file.read())
                tmp_video_path = tmp_video.name
            
            video = VideoFileClip(tmp_video_path)
            
            # Trim if duration specified
            if duration:
                video = video.subclip(0, duration)
            
            # Resize for smaller file size
            video = video.resize(0.5)
            
            output_path = tmp_video_path.replace('.mp4', '.gif')
            video.write_gif(output_path, fps=fps)
            
            # Read GIF file
            output = io.BytesIO()
            with open(output_path, 'rb') as f:
                output.write(f.read())
            
            # Cleanup
            video.close()
            os.unlink(tmp_video_path)
            os.unlink(output_path)
            
            output.seek(0)
            return output
        except Exception as e:
            logger.error(f"GIF creation error: {e}")
            raise