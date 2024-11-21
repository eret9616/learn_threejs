import { useEffect } from 'react';
import { render } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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

    const axesHelper = new THREE.AxesHelper();

    // 辅助坐标系
    scene.add(axesHelper);
    // 创建辅助平面
    const gridHelper = new THREE.GridHelper();
    scene.add(gridHelper);

    // 添加全局光照
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

    scene.add(ambientLight, directionalLight);

    // 创建立方体几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    console.log(geometry);

    const faces = [];

    for (let i = 0; i < geometry.groups.length; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff * Math.random(),
      });
      faces.push(material);
    }

    // 创建立方体的基础材质
    const material = new THREE.MeshLambertMaterial({ color: 0x1890ff });
    // 创建3D物体对象
    const mesh = new THREE.Mesh(geometry, faces);
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
      antialias: true,
    });

    // 设置渲染器屏幕像素比
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    //设置渲染器大小
    renderer.setSize(width, height);
    // 执行渲染
    renderer.render(scene, camera);

    // 创建轨道控制器
    const orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enableDamping = true;

    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      console.log(elapsedTime);

      //   mesh.rotation.y += elapsedTime / 1000;
      //   mesh.position.x += elapsedTime / 1000;
      mesh.scale.x += elapsedTime / 1000;

      orbitControls.update();
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    };
    tick();
  }, []);

  return (
    <>
      start your project
      <canvas id="c" />;
    </>
  );
};

export default Page;
