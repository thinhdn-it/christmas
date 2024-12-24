import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const Snowflakes = () => {
  const snowflakes = Array.from({ length: 50 });
  return (
    <>
      {snowflakes.map((_, i) => (
        <div
          key={i}
          className="snowflake"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        ></div>
      ))}
    </>
  );
};

const Home = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [isSantaVoicePlaying, setIsSantaVoicePlaying] = useState(false); // Trạng thái giọng nói ông già Noel
  const [isAudioMuted, setIsAudioMuted] = useState(false); // Trạng thái âm thanh (tắt/mở tất cả âm thanh)

  const santaRef = useRef(null);
  const audioRef = useRef(null);
  const santaVoiceRef = useRef(null); // Thêm ref cho giọng nói ông già Noel

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Phát nhạc nền khi trang tải
  useEffect(() => {
    const playMusic = async () => {
      try {
        if (audioRef.current && isMusicPlaying) {
          await audioRef.current.play();
          audioRef.current.volume = 0.3; // Giảm âm lượng nhạc nền xuống 30%
        //   console.log('Nhạc nền đã được phát!');
        }
      } catch (error) {
        // console.error("Không thể phát nhạc:", error);
      }
    };

    playMusic();

    const handleUserInteraction = () => {
      playMusic();
      window.removeEventListener('click', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
    };
  }, [isMusicPlaying]);

  // Dùng IntersectionObserver để phát giọng nói khi ông già Noel xuất hiện
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isSantaVoicePlaying) {
            // Khi ông già Noel xuất hiện, chờ 1 giây trước khi phát giọng nói
            setTimeout(() => {
              setIsSantaVoicePlaying(true);
              santaVoiceRef.current?.play(); // Phát giọng nói
            }, 1000); // Chờ 1 giây trước khi phát giọng nói
          } else if (!entry.isIntersecting && isSantaVoicePlaying) {
            // Dừng giọng nói khi ông già Noel không còn xuất hiện
            setIsSantaVoicePlaying(false);
            santaVoiceRef.current?.pause();
            santaVoiceRef.current.currentTime = 0; // Đặt lại thời gian phát lại
          }
        });
      },
      { threshold: 0.5 } // Khi ông già Noel chiếm 50% viewport
    );

    if (santaRef.current) {
      observer.observe(santaRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isSantaVoicePlaying]);

  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isAudioMuted; // Tắt/mở nhạc nền
    }
    if (santaVoiceRef.current) {
      santaVoiceRef.current.muted = isAudioMuted; // Tắt/mở giọng nói ông già Noel
    }
  }, [isAudioMuted]);

  if (!isMounted) return null;

  return (
    <div className="relative bg-gradient-to-b from-[rgb(155,208,173)] to-[rgb(105,155,135)] flex items-center justify-center text-white overflow-hidden min-h-screen">
      {/* Phát nhạc nền Giáng sinh */}
      <audio ref={audioRef} autoPlay loop muted={isAudioMuted}>
        <source src="/christmas-music.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      <Snowflakes />

      {/* Ông già Noel bay */}
      <div className="absolute animate-santa" ref={santaRef}>
        <Image
          src="/images/santa.png"
          alt="Santa Claus"
          width={600}
          height={300}
          priority
        />
      </div>

      <div className="absolute bottom-0 w-full">
        <Image
          src="/images/christmas.png"
          alt="Christmas"
          layout="responsive"
          width={1920}
          height={1080}
        />
      </div>

      {/* Nội dung thiệp */}
      <div className="bg-white bg-opacity-20 p-8 rounded-lg shadow-lg text-center z-10 mx-4 sm:mx-8 lg:mx-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">🎄 Merry Christmas! 🎅</h1>
        <p className="text-xl sm:text-2xl mb-8">
          Chúc bạn và gia đình có một mùa Giáng sinh an lành, hạnh phúc và tràn
          đầy niềm vui! ✨
        </p>
        <Image
          src="/images/christmas-tree.png"
          alt="Christmas Tree"
          width={Math.min(300, windowSize.width * 0.3)}
          height={Math.min(300, windowSize.height * 0.3)}
          className="mx-auto"
        />
        {/* <button
          className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-xl"
        >
          Gửi lời chúc
        </button> */}
      </div>

      {/* Icon tắt/mở âm thanh */}
      <div
        className="absolute top-4 left-4 text-white text-3xl cursor-pointer"
        onClick={toggleAudio}
      >
        {isAudioMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </div>

      {/* Giọng nói ông già Noel (lặp lại) */}
      <audio ref={santaVoiceRef} loop muted={isAudioMuted}>
        <source src="/santa-voice.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default Home;