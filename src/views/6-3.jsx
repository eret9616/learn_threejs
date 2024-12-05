import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as dat from 'dat.gui';

const Page = () => {
  useEffect(() => {
    const $ = {
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
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);

        ambientLight.visible = false;
        this.ambientLight = ambientLight;

        // 添加方向光
        const dirLight = new THREE.DirectionalLight(0xffffaa, 0.95);

        dirLight.position.set(0, 3, 1.5);
        dirLight.castShadow = true;

        const dirHelper = new THREE.DirectionalLightHelper(dirLight, 3);

        this.dirHelper = dirHelper;
        this.dirLight = dirLight;

        // 添加点光源
        const pointLight1 = new THREE.PointLight(0xf3ae3d, 0.8);
        const pointLight2 = new THREE.PointLight(0xa1fc8f, 0.8);

        pointLight1.position.set(-1, 1, 2);
        pointLight2.position.set(1, 1, 2);
        this.pointLight1 = pointLight1;
        this.pointLight2 = pointLight2;

        const sphere1 = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 64, 64),
          new THREE.MeshBasicMaterial({
            color: 0xf3ae3d,
          })
        );
        const sphere2 = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 64, 64),
          new THREE.MeshBasicMaterial({
            color: 0xa1fc8f,
          })
        );
        sphere1.position.copy(pointLight1.position);
        sphere2.position.copy(pointLight2.position);
        this.sphere1 = sphere1;
        this.sphere2 = sphere2;
        this.scene.add(
          ambientLight,
          dirLight,
          dirHelper,
          pointLight1,
          pointLight2,
          sphere1,
          sphere2
        );
      },
      loadTextures() {
        // const img = new Image()
        // const texture = new THREE.Texture(img)
        // img.src = '/src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_basecolor.jpg'
        // img.onload = function(){
        //   texture.needsUpdate = true
        // }

        // const textLoader = new THREE.TextureLoader()
        // this.texture = textLoader.setCrossOrigin('anonymous').load('/src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_basecolor.jpg',
        // // onload 回调
        //   function(texture){
        //   },
        //   null,
        //   (err)=>{
        //     console.log(err);
        //   }
        // )

        const manager = new THREE.LoadingManager();
        manager.onStart = function (url, itemsLoaded, itemsTotal) {
          console.log(
            'Started loading file: ' +
              url +
              '.\nLoaded ' +
              itemsLoaded +
              ' of ' +
              itemsTotal +
              ' files.'
          );
        };
        manager.onLoad = function () {
          console.log('Loading complete!');
        };
        manager.onProgress = function (url, itemsLoaded, itemsTotal) {
          console.log(
            'Loading file: ' +
              url +
              '.\nLoaded ' +
              itemsLoaded +
              ' of ' +
              itemsTotal +
              ' files.'
          );
        };
        manager.onError = function (url) {
          console.log('There was an error loading ' + url);
        };
        const textureLoader = new THREE.TextureLoader(manager);

        const floorTexture = textureLoader.load(
          '/src/assets/textures/floor_tiles_06/floor_tiles_06_diff_2k.jpg'
        );

        const wallTexture = textureLoader.load(
          'src/assets/textures/large_sandstone_blocks/large_sandstone_blocks_diff_2k.jpg'
        );

        this.floorTexture = floorTexture;
        this.wallTexture = wallTexture;
      },
      createObjects() {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshLambertMaterial({
            color: 0x1890ff,
          })
        );

        const geometry = new THREE.PlaneGeometry(100, 100);

        const floor = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({
            // color: 0xfafccf,
            side: THREE.DoubleSide,
          })
        );

        const wall = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({
            // color: 0xfafccf,
            side: THREE.DoubleSide,
          })
        );

        box.castShadow = true;
        wall.position.z = -5;
        floor.receiveShadow = true;
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.8;
        floor.position.z = -2;

        const sky = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({
            side: THREE.DoubleSide,
          })
        );
        this.dirLight.target = box;
        this.box = box;
        sky.position.y = 20;
        sky.rotation.x = -Math.PI / 2;
        this.scene.add(box, floor, sky, wall);
      },
      createCamera() {
        // 创建第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          1000
        );
        watcherCamera.position.set(0, 0, 4);
        watcherCamera.lookAt(this.scene.position);
        this.scene.add(watcherCamera);
        this.camera = watcherCamera;
      },
      datGui() {
        const _this = this;
        if (window.gui) {
          window.gui.destroy();
        }
        const gui = new dat.GUI();
        window.gui = gui;

        const ambientFolder = gui.addFolder('环境光');

        ambientFolder
          .add(_this.ambientLight, 'intensity', 0, 1, 0.1)
          .name('环境光强度');
        ambientFolder.add(_this.ambientLight, 'visible').name('环境光可见性');
        ambientFolder
          .addColor(
            {
              color: 0xffffff,
            },
            'color'
          )
          .onChange((color) => {
            _this.ambientLight.color.set(color);
          });
        // ambientFolder.open();

        const dirLightFolder = gui.addFolder('方向光');
        dirLightFolder.add(_this.dirLight, 'intensity', 0, 1, 0.1);
        dirLightFolder.add(_this.dirLight, 'visible');
        dirLightFolder.add(_this.dirLight.position, 'x', -20, 20, 0.1);
        dirLightFolder.add(_this.dirLight.position, 'y', -20, 20, 0.1);
        dirLightFolder.add(_this.dirLight.position, 'z', -20, 20, 0.1);
        // dirLightFolder.open();

        const shadowMapFolder = gui.addFolder('阴影');
        shadowMapFolder.open();
        shadowMapFolder
          .add(_this.dirLight.shadow.mapSize, 'x', 0, 2048, 1)
          .name('x');
        shadowMapFolder
          .add(_this.dirLight.shadow.mapSize, 'y', 0, 2048, 1)
          .name('y');
        shadowMapFolder
          .add(_this.dirLight.shadow, 'radius', 0, 100, 0.1)
          .name('r');

        const boxFolder = gui.addFolder('box');
        boxFolder.open();
        boxFolder.add(_this.box.position, 'x', -20, 20, 0.1).onChange(() => {
          _this.dirHelper.update();
        });
        boxFolder.add(_this.box.position, 'y', -20, 20, 0.1).onChange(() => {
          _this.dirHelper.update();
        });
        boxFolder.add(_this.box.position, 'z', -20, 20, 0.1).onChange(() => {
          _this.dirHelper.update();
        });

        const pointsFolder = gui.addFolder('点光源');
        pointsFolder
          .add(_this.pointLight1, 'intensity', 0, 1, 0.1)
          .name('p1光照强度');
        pointsFolder
          .add(_this.pointLight1, 'distance', 0, 20, 0.1)
          .name('p1照射距离');
        pointsFolder.add(_this.pointLight1, 'decay', 0, 20, 0.1).name('p1衰减');
        pointsFolder
          .add(_this.pointLight1.position, 'x', -20, 20, 0.1)
          .onChange((val) => {
            _this.sphere1.position.x = val;
          });
        pointsFolder
          .add(_this.pointLight1.position, 'y', -20, 20, 0.1)
          .onChange((val) => {
            _this.sphere1.position.y = val;
          });
        pointsFolder
          .add(_this.pointLight1.position, 'z', -20, 20, 0.1)
          .onChange((val) => {
            _this.sphere1.position.z = val;
          });

        pointsFolder
          .add(_this.pointLight2, 'intensity', 0, 1, 0.1)
          .name('p2光照强度');
        // 照射距离
        pointsFolder
          .add(_this.pointLight2, 'distance', 0, 20, 0.1)
          .name('p2照射距离');
        // 衰减
        pointsFolder.add(_this.pointLight2, 'decay', 0, 20, 0.1).name('p2衰减');
        pointsFolder
          .add(_this.pointLight2.position, 'x', -20, 20, 0.1)
          .onChange((val) => {
            _this.sphere2.position.x = val;
          });
        pointsFolder
          .add(_this.pointLight2.position, 'x', -20, 20, 0.1)
          .onChange((val) => {
            _this.sphere2.position.x = val;
          });
        pointsFolder
          .add(_this.pointLight2.position, 'x', -20, 20, 0.1)
          .onChange((val) => {
            _this.sphere2.position.x = val;
          });

        pointsFolder.open();
      },
      helpers() {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        // 创建辅助平面
        this.scene.add(axesHelper);
      },
      render() {
        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
        });

        renderer.shadowMap.enabled = true;

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
        // update objects
        this.pointLight1.position.x = Math.sin(elapsedTime) * 5;
        this.pointLight1.position.z = Math.cos(elapsedTime) * 5;
        this.sphere1.position.copy(this.pointLight1.position);

        this.orbitControls.update();
        // this.texture.offset.x+=0.01
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(() => this.tick());
      },
      fitView() {
        window.addEventListener('resize', () => {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
      },
      init() {
        this.createScene();
        this.createLights();
        this.loadTextures();
        this.createObjects();
        this.createCamera();
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
      <canvas id="c" />;
    </>
  );
};

export default Page;
