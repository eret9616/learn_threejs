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

        dirLight.position.set(0, 1, 2);
        dirLight.castShadow = true;
        const dirHelper = new THREE.DirectionalLightHelper(dirLight, 3);

        const hemiLight = new THREE.HemisphereLight(0x00ffff, 0xffff55, 0.7);
        const hemiHelper = new THREE.HemisphereLightHelper(hemiLight, 1);
        this.scene.add(ambientLight, dirLight, dirHelper, hemiLight);

        this.dirHelper = dirHelper;
        this.dirLight = dirLight;
        this.hemiLight = hemiLight;
        this.scene.add(ambientLight, dirLight, dirHelper, hemiHelper);
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

        const geometry = new THREE.PlaneGeometry(10000, 10000);

        const floor = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({
            // color: 0xfafccf,
            side: THREE.DoubleSide,
          })
        );

        // const wall = new THREE.Mesh(geometry, material);

        box.castShadow = true;
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
        this.scene.add(box, floor, sky);
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
        ambientFolder.open();

        const dirLightFolder = gui.addFolder('方向光');
        dirLightFolder.add(_this.dirLight, 'intensity', 0, 1, 0.1);
        dirLightFolder.add(_this.dirLight, 'visible');
        dirLightFolder.add(_this.dirLight.position, 'x', -20, 20, 0.1);
        dirLightFolder.add(_this.dirLight.position, 'y', -20, 20, 0.1);
        dirLightFolder.add(_this.dirLight.position, 'z', -20, 20, 0.1);
        dirLightFolder.open();
        dirLightFolder.open();

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

        const hemiFolder = gui.addFolder('半球光');
        hemiFolder
          .add(_this.hemiLight, 'intensity', 0, 1, 0.1)
          .name('半球光强度');
        hemiFolder.add(_this.hemiLight, 'visible').name('半球光可见性');
        hemiFolder.add(_this.hemiLight.position, 'x', -20, 20, 0.1);
        hemiFolder.add(_this.hemiLight.position, 'y', -20, 20, 0.1);
        hemiFolder.add(_this.hemiLight.position, 'z', -20, 20, 0.1);
        hemiFolder.open();
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
      tick() {
        this.orbitControls.update();
        // this.texture.offset.x+=0.01
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
