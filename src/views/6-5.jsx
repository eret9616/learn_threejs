import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import { HeartCurve } from 'three/examples/jsm/curves/CurveExtras';

const Page = () => {
  useEffect(() => {
    const $ = {
      cameraIndex: 0,
      createScene() {
        const canvas = document.getElementById('c');
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        this.canvas = canvas;
        this.width = width;
        this.height = height;

        // 创建3D场景对象
        const scene = new THREE.Scene();
        this.scene = scene;
      },
      createLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        this.ambientLight = ambientLight;

        // 添加聚光灯
        const spotLight = new THREE.SpotLight(0xff00ff, 0.95);

        spotLight.intensity = 1;
        spotLight.distance = 100;
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.3;
        spotLight.position.y = 10;
        spotLight.castShadow = true;

        const spotHelper = new THREE.SpotLightHelper(spotLight);

        spotHelper.update();
        // spotHelper.visible = false

        this.spotLight = spotLight;
        this.spotHelper = spotHelper;
        this.scene.add(ambientLight, spotLight, spotHelper);
      },
      createObjects() {
        const box = new THREE.Mesh(
          new THREE.SphereGeometry(2, 64, 64),
          new THREE.MeshLambertMaterial({
            color: 0x1890ff,
          })
        );
        const geometry = new THREE.PlaneGeometry(1000, 1000);
        const material = new THREE.MeshLambertMaterial({
          color: 0x666666,
        });
        const floor = new THREE.Mesh(geometry, material);

        const sky = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({
            color: 0x666666,
            side: THREE.DoubleSide,
          })
        );

        box.castShadow = true; // 产生阴影
        floor.receiveShadow = true; // 接收阴影
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        box.position.y = 2.5;

        sky.rotation.x = -Math.PI / 2;
        sky.position.y = 60;
        sky.castShadow = true;

        this.spotLight.target = box;
        this.spotHelper.update();

        this.box = box;
        this.scene.add(box, floor, sky);
        this.box = box;
      },
      createCamera() {
        // 创建相机对象
        const pCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          1,
          10
        );
        pCamera.position.set(-2, 15, 15); //
        pCamera.lookAt(this.scene.position); //
        this.scene.add(pCamera);
        this.pCamera = pCamera;
        // this.camera = pCamera

        // 创建相机对象
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );
        watcherCamera.position.set(2, 2, 6);
        watcherCamera.lookAt(this.scene.position);
        this.watcherCamera = watcherCamera;
        this.scene.add(watcherCamera);
        this.camera = watcherCamera;
      },
      datGui() {
        const gui = new dat.GUI();

        const ambientFolder = gui.addFolder('环境光');
        ambientFolder
          .add(this.ambientLight, 'intensity', 0, 1, 0.1)
          .name('环境光强度');
        ambientFolder.add(this.ambientLight, 'visible').name('环境光可见性');
        ambientFolder.addColor({ color: 0xffffff }, 'color').onChange((val) => {
          this.ambientLight.color = new THREE.Color(val);
        });
        ambientFolder.open();
        // const dirLightFolder = gui.addFolder('方向光')
        // dirLightFolder.add(this.dirLight,'intensity',0,1,0.1)
        // dirLightFolder.add(this.dirLight,'visible')
        // dirLightFolder.add(this.dirLight.position,'x',-20,20,0.1)
        // dirLightFolder.add(this.dirLight.position,'y',-20,20,0.1)
        // dirLightFolder.add(this.dirLight.position,'z',-20,20,0.1)

        // dirLightFolder.open()

        const shadowMapFolder = gui.addFolder('阴影');
        // console.log(this.dirLight.shadow)
        // shadowMapFolder.add(this.dirLight.shadow.mapSize,'x',[512,1024,2048,4096])
        // shadowMapFolder.add(this.dirLight.shadow.mapSize,'y',[512,1024,2048,4096])
        // shadowMapFolder.add(this.dirLight.shadow,'radius',0,30,1)
        shadowMapFolder.open();

        const boxFolder = gui.addFolder('box');
        boxFolder.add(this.box.position, 'x', -20, 20, 0.1).onChange((val) => {
          this.spotHelper.update();
        });
        boxFolder.add(this.box.position, 'y', -20, 20, 0.1).onChange((val) => {
          // this.dirHelper.update()
        });
        boxFolder.add(this.box.position, 'z', -20, 20, 0.1).onChange((val) => {
          // this.dirHelper.update()
        });
        boxFolder.open();

        const spotFolder = gui.addFolder('spotLight');
        spotFolder.open();
        spotFolder.add(this.spotLight, 'intensity', 0, 1, 0.1).name('强度');
        spotFolder.add(this.spotLight, 'visible').name('可见性');
        spotFolder
          .add(this.spotLight, 'distance', 0, 100, 1)
          .name('距离')
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight, 'angle', 0, Math.PI / 2, 0.1)
          .name('角度')
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight, 'penumbra', 0, 1, 0.1)
          .name('半影')
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight, 'decay', 0, 10, 0.1)
          .name('衰减')
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight, 'power', 0, 30, 0.1)
          .name('光功率')
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight.position, 'x', -30, 30, 0.1)
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight.position, 'y', -30, 30, 0.1)
          .onChange((val) => {
            this.spotHelper.update();
          });
        spotFolder
          .add(this.spotLight.position, 'z', -30, 30, 0.1)
          .onChange((val) => {
            this.spotHelper.update();
          });

        const params = {
          near: this.spotLight.shadow.camera.near,
          far: this.spotLight.shadow.camera.far,
          fov: this.spotLight.shadow.camera.fov,
          radius: this.spotLight.shadow.radius,
        };
        this.params = params;
        spotFolder.add(this.spotLight, 'castShadow').name('阴影');
        spotFolder.add(params, 'near', 0.01, 10, 0.01).name('阴影相机near');
        spotFolder.add(params, 'far', 0.01, 10, 0.01).name('阴影相机far');
      },
      helpers() {
        // 创建辅助坐标系
        // 创建辅助平面
        const axesHelper = new THREE.AxesHelper();
        const gridHelper = new THREE.GridHelper(1000, 100, 0xf0f0f0, 0xe0e0e0);
        const cameraHelper = new THREE.CameraHelper(
          this.spotLight.shadow.camera
        );

        gridHelper.position.y = -0.999;
        this.cameraHelper = cameraHelper;
        this.scene.add(gridHelper);
      },
      render() {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
        });

        // 开启阴影渲染
        renderer.shadowMap.enabled = true;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // 设置渲染器屏幕像素比
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        // 设置渲染器大小
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
      clock: new THREE.Clock(),
      tick() {
        const elapsedTime = this.clock.getElapsedTime();
        this.box.position.x = Math.sin(elapsedTime) * 10;
        this.box.position.z = Math.cos(elapsedTime) * 4;

        this.spotLight.position.x = Math.sin(elapsedTime) * 10;
        this.spotLight.position.y = Math.sin(elapsedTime) * 2 + 10;
        this.spotLight.position.z = Math.sin(elapsedTime) * 2;

        this.spotLight.shadow.camera.near = this.params.near;
        this.spotLight.shadow.camera.fov = this.params.fov;
        this.spotLight.shadow.radius = this.params.radius;
        this.cameraHelper.update();
        this.spotHelper.update();

        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => this.tick());
      },
      fitView() {
        window.addEventListener('resize', () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        });
      },
      init() {
        this.createScene();
        this.createLights();
        this.createObjects();
        this.createCamera();
        this.helpers();
        this.render();
        this.controls();
        this.datGui();
        this.tick();
        this.fitView();
      },
    };
    $.init();
  }, []);

  return (
    <>
      <canvas id="c" />;
    </>
  );
};

export default Page;
