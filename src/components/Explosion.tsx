import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Vector3, Mesh, AdditiveBlending } from 'three';
import * as THREE from 'three';

interface ExplosionProps {
  position: Vector3;
  color: string;
  size?: number;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const Explosion: React.FC<ExplosionProps> = ({
  position,
  color,
  size = 1,
  duration = 1,
  particleCount = 20,
  onComplete
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particles = useRef<Array<{
    mesh: Mesh;
    velocity: Vector3;
    startTime: number;
  }>>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;

    // Set the group's position to the explosion point
    group.position.copy(position);

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = new Mesh(
        new THREE.SphereGeometry(0.05 * size, 8, 8),
        new THREE.MeshBasicMaterial({
          color: new Color(color),
          transparent: true,
          opacity: 1,
          blending: AdditiveBlending,
        })
      );

      // Random direction from center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const velocity = new Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      ).multiplyScalar(0.2 * size); // Increased velocity

      // Start from center
      particle.position.set(0, 0, 0);
      
      // Add point light to each particle
      const light = new THREE.PointLight(color, 2, 1);
      particle.add(light);
      
      group.add(particle);

      particles.current.push({
        mesh: particle,
        velocity: velocity,
        startTime: Date.now()
      });
    }

    return () => {
      particles.current.forEach(particle => {
        group.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        if (particle.mesh.material instanceof THREE.Material) {
          particle.mesh.material.dispose();
        }
      });
      particles.current = [];
    };
  }, [position, color, size, particleCount]);

  useFrame(() => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime.current) / 1000;

    if (elapsedTime > duration) {
      if (groupRef.current) {
        particles.current.forEach(particle => {
          groupRef.current?.remove(particle.mesh);
        });
        particles.current = [];
      }
      if (onComplete) onComplete();
      return;
    }

    particles.current.forEach(particle => {
      // Update particle positions with velocity and gravity
      particle.mesh.position.add(particle.velocity);
      particle.velocity.y -= 0.02; // Increased gravity

      // Fade out particles
      const particleElapsedTime = (currentTime - particle.startTime) / 1000;
      const opacity = 1 - particleElapsedTime / duration;
      const scale = 1 - (particleElapsedTime / duration) * 0.5;

      if (particle.mesh.material instanceof THREE.MeshBasicMaterial) {
        particle.mesh.material.opacity = opacity;
      }
      particle.mesh.scale.setScalar(scale * size);
    });
  });

  return <group ref={groupRef} />;
};

export default Explosion; 