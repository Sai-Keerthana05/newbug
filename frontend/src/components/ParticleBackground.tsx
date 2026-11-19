import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0 -z-10 w-full h-full"
      options={{
        fullScreen: { enable: false },
        fpsLimit: 60,
        background: {
          color: {
            value: 'transparent'
          }
        },
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push'
            },
            onHover: {
              enable: true,
              mode: 'grab',
              parallax: {
                enable: true,
                force: 60,
                smooth: 10
              }
            },
            resize: true
          },
          modes: {
            push: {
              quantity: 4
            },
            grab: {
              distance: 180,
              links: {
                opacity: 0.5,
                color: '#3b82f6'
              }
            }
          }
        },
        particles: {
          color: {
            value: ['#ffffff', '#3b82f6', '#06b6d4', '#ef4444'] // White, blue, cyan, and occasional red accent
          },
          links: {
            color: '#3b82f6',
            distance: 140,
            enable: true,
            opacity: 0.3,
            width: 1.2
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce'
            },
            random: false,
            speed: 1.2,
            straight: false
          },
          number: {
            density: {
              enable: true,
              area: 800
            },
            value: 110
          },
          opacity: {
            value: { min: 0.2, max: 0.7 }
          },
          shape: {
            type: 'circle'
          },
          size: {
            value: { min: 1, max: 4 }
          }
        },
        detectRetina: true
      }}
    />
  );
};

export default ParticleBackground;
