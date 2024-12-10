import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as dat from 'dat.gui';
import { fog } from 'three/examples/jsm/nodes/Nodes.js';

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

        // 创建雾
        const fog = new THREE.Fog(0xe0e0e0, 0, 20);

        // 创建3D场景对象
        fog.name = 'fog';
        const scene = new THREE.Scene();
        scene.fog = fog;
        scene.background = new THREE.Color(0xe0e0e0);
        this.scene = scene;
      },
      createLights() {
        // 添加全局光照
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);

        ambientLight.visible = true;
        this.ambientLight = ambientLight;

        this.scene.add(ambientLight);
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
      },
      createMeshes(mapcapTexture) {
        const geometry = new THREE.TorusGeometry(
          Math.random(), //[0,1)
          Math.abs(Math.random() - 0.5), // [0-0.5)
          32
        );
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshMatcapMaterial({
            color: 0xffffff,
            matcap: mapcapTexture,
          })
        );
        mesh.position.x = (Math.random() - 0.5) * 50;
        mesh.position.y = 1;
        mesh.position.z = (Math.random() - 0.5) * 50;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        mesh.scale.x = Math.random() * 0.3 + 0.5;
        mesh.scale.y = Math.random() * 0.3 + 0.5;
        mesh.scale.z = Math.random() * 0.3 + 0.5;

        this.scene.add(mesh);
      },
      createObjects() {
        const textureLoader = new THREE.TextureLoader();
        const mapcapTexture = textureLoader.load(
          'src/assets/textures/matcaps/BA472D_CA6E67-256px.png'
        );

        for (let i = 0; i < 300; i++) {
          this.createMeshes(mapcapTexture);
        }

        this.createMeshes();
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

        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.8;
        floor.position.z = -2;

        this.box = box;
        this.scene.add(box, floor);
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

        // 控制环境光开启
        const ambientFolder = gui.addFolder('环境光');
        ambientFolder.add(this.ambientLight, 'visible').name('开启环境光');
        ambientFolder.open();

        // 控制box的x坐标
        const boxFolder = gui.addFolder('box');
        boxFolder.add(_this.box.material, 'fog').onChange((val) => {
          const material = new THREE.MeshLambertMaterial({
            color: 0x1890ff,
          });
          material.fog = val;
          _this.box.material = material;
        });
        boxFolder.add(_this.box.position, 'x', -20, 20, 0.1).onChange(() => {});
        // z
        boxFolder.add(_this.box.position, 'z', -20, 20, 0.1).onChange(() => {});
        boxFolder.open();

        const fogFolder = gui.addFolder('雾');
        // 修改后
        fogFolder
          .addColor({ color: _this.scene.fog.color.getHex() }, 'color')
          .onChange((val) => {
            _this.scene.fog.color.set(val);
            // background
            _this.scene.background.set(val);
          });

        //   near
        fogFolder.add(_this.scene.fog, 'near', 0, 100, 0.1).onChange(() => {});
        //   far
        fogFolder.add(_this.scene.fog, 'far', 10, 100, 0.1);
        fogFolder.open();
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
