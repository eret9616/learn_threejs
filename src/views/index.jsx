import { useEffect } from 'react';
import * as THREE from 'three';

const Page = () => {
  useEffect(() => {
    console.log(THREE);
    const canvas = document.getElementById('c');

    const width = window.innerWidth;
    const height = window.innerHeight;
    // Set the canvas width and height
    canvas.height = height;
    canvas.width = width;

    const scene = new THREE.Scene();

    // 创建立方体几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // 创建立方体的基础材质
    const material = new THREE.MeshBasicMaterial({ color: 0x1890ff });
    // 创建3D物体对象
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 创建相机对象
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    // 设置相机位置
    camera.position.set(2, 2, 3); // x,y,z
    // 单位是向量
    // 相机朝向
    camera.lookAt(scene.position);
    scene.add(camera);

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas,
    });
    //设置渲染器大小
    renderer.setSize(width, height);
    // 执行渲染
    renderer.render(scene, camera);
  }, []);

  return (
    <>
      start your project
      <canvas id="c" />;
    </>
  );
};

export default Page;
