import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getSiteSettings } from '../../services/api';
import styles from './Banner.module.css';

const Banner = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load banner settings', err);
      }
    };
    fetchSettings();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className={styles.bannerSection}>
      <div className={styles.bannerCard}>
        {/* Background Video */}
        {settings?.bannerVideoUrl ? (
          <video
            key={settings.bannerVideoUrl}
            ref={videoRef}
            className={styles.bannerVideo}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            poster="https://images.unsplash.com/photo-1581791538302-03537b9c97bf?auto=format&fit=crop&w=1600&q=80"
          >
            <source src={settings.bannerVideoUrl} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        ) : (
          <video
            className={styles.bannerVideo}
            poster="https://images.unsplash.com/photo-1581791538302-03537b9c97bf?auto=format&fit=crop&w=1600&q=80"
          />
        )}

        {/* Overlay Dark Gradient */}
        <div className={styles.bannerOverlay}>
          <div className={styles.centerTitleWrapper}>
            {(settings ? settings.bannerVideoTitle : 'Ladakh') && (
              <h1 className={styles.ladakhScriptTitle}>{settings ? settings.bannerVideoTitle : 'Ladakh'}</h1>
            )}
            {(settings ? settings.bannerVideoSubtitle : 'Uncharted Expeditions & Bike Trips') && (
              <p className={styles.ladakhSubtitle}>{settings ? settings.bannerVideoSubtitle : 'Uncharted Expeditions & Bike Trips'}</p>
            )}
          </div>

          {/* Floating Video Control Buttons */}
          <div className={styles.videoControls}>
            <button
              className={styles.controlBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
            </button>
            <button
              className={styles.controlBtn}
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
