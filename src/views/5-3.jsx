import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);

        directionalLight.position.set(2, 2, 0);

        this.directionalLight = directionalLight;
        this.scene.add(ambientLight, directionalLight);
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

        const texture = textureLoader.load(
          '/src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_basecolor.jpg'
        );
        const aoTexture = textureLoader.load(
          '/src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_ambientOcclusion.jpg'
        );
        const bumpTexture = textureLoader.load(
          '/src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_height.png'
        );
        const normalTexture = textureLoader.load(
          '/src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_normal.jpg'
        );
        const roughnessTexture = textureLoader.load(
          '/src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_roughness.jpg'
        );
        const metalTexture = textureLoader.load(
          '/src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_metallic.jpg'
        );

        // 纹理回环
        texture.repeat.set(2, 2);
        texture.wrapS = THREE.RepeatWrapping; // 默认值 ClampToEdgeWrapping 阵列： RepeatWrapping 镜像: MirroredRepeatWrapping
        texture.wrapT = THREE.RepeatWrapping; // 默认值 ClampToEdgeWrapping 阵列： RepeatWrapping 镜像: MirroredRepeatWrapping

        // 纹理偏移
        texture.offset = new THREE.Vector2(0.5, 0.5);
        // 旋转
        texture.rotation = Math.PI / 12; // 正值：逆时针
        texture.center.set(0.5, 0.5);

        this.textureLoader = textureLoader;
        this.aoTexture = aoTexture;
        this.texture = texture;
        this.bumpTexture = bumpTexture;
        this.normalTexture = normalTexture;
        this.roughnessTexture = roughnessTexture;
        this.metalTexture = metalTexture;

        // 环境贴图加载器
        const cubeTextureLoader = new THREE.CubeTextureLoader();
        const envTexture = cubeTextureLoader.load([
          '/src/assets/textures/fullscreen/1.left.jpg',
          '/src/assets/textures/fullscreen/1.right.jpg',
          '/src/assets/textures/fullscreen/1.top.jpg',
          '/src/assets/textures/fullscreen/1.bottom.jpg',
          '/src/assets/textures/fullscreen/1.front.jpg',
          '/src/assets/textures/fullscreen/1.back.jpg',
        ]);
        this.envTexture = envTexture;
      },
      createObjects() {
        const material = new THREE.MeshStandardMaterial({
          map: this.texture,
        });
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 16),
          material
        ); // 球体
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 16),
          new THREE.MeshStandardMaterial({
            map: this.texture,
            envMap: this.envTexture,
            envMapIntensity: 1,
            metalnessMap: this.metalTexture,
            metalness: 0.5,
            roughnessMap: this.roughnessTexture,
            roughness: 0.1,
          })
        ); // 球体

        sphere.position.x = -1.2;
        mesh.position.x = 1.2;

        this.mesh = mesh;
        this.material = material;
        this.sphere = sphere;
        this.scene.add(sphere, mesh);
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
        let _this = this;
        if (window.gui) window.gui.dispose();
        const gui = new dat.GUI();
        window.gui = gui;

        gui.add(_this.mesh.material, 'envMapIntensity', 0, 1, 0.1);
        gui.add(_this.mesh.material, 'metalness', 0, 1, 0.1);
        gui.add(_this.mesh.material, 'roughness', 0, 1, 0.1);
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
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
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
