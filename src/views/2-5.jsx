import { useEffect } from 'react';
import { render } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Wireframe } from 'three/examples/jsm/lines/Wireframe.js';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras.js';

const Page = () => {
  useEffect(() => {
    const $ = {
      cameraIndex: 0,
      createScene() {
        console.log(THREE);
        const canvas = document.getElementById('c');
        const width = window.innerWidth;
        const height = window.innerHeight;
        // Set the canvas width and height
        canvas.height = height;
        canvas.width = width;
        this.canvas = canvas;
        this.height = height;
        this.width = width;
        const scene = new THREE.Scene();
        this.scene = scene;
      },
      createLights() {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

        this.scene.add(ambientLight, directionalLight);
      },
      createObjects() {
        // 创建立方体几何体
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        console.log(geometry);

        // 创建立方体的基础材质
        const material = new THREE.MeshLambertMaterial({ color: 0x1890ff });
        // 创建3D物体对象
        const mesh = new THREE.Mesh(geometry, material);

        // 调用后geometry属性上才有boundingBox属性
        mesh.geometry.computeBoundingBox();

        console.log(mesh);

        this.scene.add(mesh);
        this.mesh = mesh;
      },
      createCamera() {
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );

        pCamera.position.set(0, 0, 20); // x,y,z
        pCamera.lookAt(this.scene.position);
        this.scene.add(pCamera);
        this.camera = pCamera;
        this.pCamera = pCamera;

        // 用第二个相机观察
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );

        watcherCamera.position.set(0, 0, 20); // x,y,z
        watcherCamera.lookAt(this.scene.position);
        this.watcherCamera = watcherCamera;
        this.scene.add(watcherCamera);
        // this.camera = watcherCamera; // 覆盖camera

        // 通过camera计算出视锥
        // const frustum = new THREE.Frustum();
        // this.camera.updateProjectionMatrix(); // 更新以保证拿到正确的结果
        // frustum.setFromProjectionMatrix(
        //   new THREE.Matrix4().multiplyMatrices(
        //     this.pCamera.projectionMatrix,
        //     this.pCamera.matrixWorldInverse
        //   )
        // );
        // const result = frustum.intersectsBox(this.mesh.geometry.boundingBox);
        // console.log(result);
      },
      curveGenerator() {
        const curve = new HeartCurve(1);
        const tubeGeometry = new THREE.TubeGeometry(curve, 200, 0.01, 8, true);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const tubeMesh = new THREE.Mesh(tubeGeometry, material);

        // 把曲线分隔成1000段
        this.points = curve.getPoints(3000);
        // const index = 0;
        // const point = points[index];
        // this.camera.position.set(point.x, point.y, point.z);

        tubeMesh.rotation.x = -Math.PI / 2;
        this.scene.add(tubeMesh);
        this.curve = curve;

        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 64);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

        sphereMesh.position.copy(this.pCamera.position);
        this.sphereMesh = sphereMesh;
        this.scene.add(sphereMesh);
      },
      datGui() {
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;
        const params = {
          color: 0x1890ff,
          Wireframe: false,
          switchCamera: () => {
            _this.orbitControls.dispose();

            if (_this.cameraIndex === 0) {
              _this.camera = _this.watcherCamera;
              _this.cameraIndex = 1;
            } else {
              _this.camera = _this.pCamera;
              _this.cameraIndex = 0;
            }
            _this.orbitControls = new OrbitControls(_this.camera, _this.canvas);
          },
        };

        console.log(this.camera);
        gui
          .add(this.camera.position, 'x')
          .min(-10)
          .max(10)
          .step(0.1)
          .name('positionX');
        gui.add(this.camera.rotation, 'x', 0.1, 10, 0.1).name('rotationX');
        gui.add(this.pCamera, 'near', 0.01, 10, 0.01).onChange((val) => {
          console.log(val);
          this.camera.near = val;
          this.camera.updateProjectionMatrix();

          // 通过camera计算出视锥
          const frustum = new THREE.Frustum();
          this.pCamera.updateProjectionMatrix(); // 更新以保证拿到正确的结果
          frustum.setFromProjectionMatrix(
            new THREE.Matrix4().multiplyMatrices(
              this.pCamera.projectionMatrix,
              this.pCamera.matrixWorldInverse
            )
          );
          const result = frustum.intersectsBox(this.mesh.geometry.boundingBox);
          console.log(result);
        });
        gui.add(this.camera, 'far', 1, 100, 1).onChange((val) => {
          console.log(val);
          this.camera.far = val;
          this.camera.updateProjectionMatrix();
        });

        gui.add(this.camera, 'zoom', 0.1, 10, 0.1).onChange((val) => {
          this.camera.zoom = val;
          this.camera.updateProjectionMatrix();
        });
        gui.add(params, 'Wireframe').onChange((val) => {
          this.mesh.material.wireframe = val;
        });

        gui.add(this.camera, 'fov', 40, 150, 1).onChange((val) => {
          this.camera.fov = val;
          this.camera.updateProjectionMatrix();
        });

        gui.add(params, 'switchCamera');
        gui.addColor(params, 'color').onChange((val) => {
          console.log(val);
          _this.mesh.material.color.set(val);
        });
      },
      helpers() {
        const axesHelper = new THREE.AxesHelper();
        const cameraHelper = new THREE.CameraHelper(this.pCamera);

        this.scene.add(axesHelper);
        // 创建辅助平面
        const gridHelper = new THREE.GridHelper();
        this.scene.add(gridHelper, cameraHelper);
      },
      render() {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
        });
        // 设置渲染器屏幕像素比
        renderer.setPixelRatio(window.devicePixelRatio || 1);

        //设置渲染器大小
        renderer.setSize(this.width, this.height);
        // 执行渲染
        renderer.render(this.scene, this.camera);
        this.renderer = renderer;
      },
      controls() {
        // 创建轨道控制器
        const orbitControls = new OrbitControls(this.camera, this.canvas);
        orbitControls.enableDamping = true;
        this.orbitControls = orbitControls;
      },
      count: 0, //当前点的index
      moveCamera() {
        const index = this.count % this.points.length;
        const point = this.points[index];
        const nextPoint =
          this.points[index + 1 >= this.points.length ? 0 : index + 1];

        this.pCamera.position.set(point.x, 0, -point.y);
        this.pCamera.lookAt(nextPoint.x, 0, -nextPoint.y);
        this.sphereMesh.position.set(point.x, 0, -point.y);
        this.count++;
      },
      tick() {
        // this.mesh.rotation.y += 0.01;
        this.orbitControls.update();
        this.moveCamera();

        // this.cameraHelper.update();
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => {
          return this.tick();
        });
      },
      fitView() {
        window.addEventListener(
          'resize',
          () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);

            camera.aspect = width / height;
            camera.updateProjectionMatrix();
          },
          false //
        );
      },
      init() {
        this.createScene();
        this.createLights();
        this.createObjects();
        this.createCamera();
        this.curveGenerator();
        this.helpers();
        this.render();
        this.controls();
        this.tick();
        this.fitView();
        this.datGui();
      },
    };
    $.init();
  }, []);

  return (
    <>
      start your project
      <canvas id="c" />;
    </>
  );
};

export default Page;
