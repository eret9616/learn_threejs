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
          '/src/assets/textures/Glass_Vintage_001/Glass_Vintage_001_basecolor.jpg'
        );
        const aoTexture = textureLoader.load(
          '/src/assets/textures/Wood_Ceiling_Coffers_003/Wood_Ceiling_Coffers_003_ambientOcclusion.jpg'
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
        const specularTexture = textureLoader.load(
          '/src/assets/textures/earth/earth_specular_2048.jpg'
        );
        const matcapTexture = textureLoader.load(
          '/src/assets/textures/matcaps/BA472D_CA6E67-256px.png'
        );

        const threeToneTexture = textureLoader.load(
          '/src/assets/textures/threeTone.jpg'
        );
        const fiveToneTexture = textureLoader.load(
          '/src/assets/textures/fiveTone.jpg'
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
        this.matcapTexture = matcapTexture;
        this.aoTexture = aoTexture;
        this.texture = texture;
        this.bumpTexture = bumpTexture;
        this.normalTexture = normalTexture;
        this.roughnessTexture = roughnessTexture;
        this.metalTexture = metalTexture;
        this.specularTexture = specularTexture;
        this.threeToneTexture = threeToneTexture;
        this.fiveToneTexture = fiveToneTexture;
        threeToneTexture.magFilter = THREE.NearestFilter;
        fiveToneTexture.magFilter = THREE.NearestFilter;

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
        const material = new THREE.MeshToonMaterial({
          transparent: true,
          side: THREE.DoubleSide,
          map: this.texture,
        });
        const box = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          material
        ); // 立方体
        const meshMaterial = new THREE.MeshToonMaterial({
          map: this.texture,
          gradientMap: this.threeToneTexture,
          // normalMap:this.normalTexture,

          // specular:0x00ffff,
        });
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 64, 64),
          meshMaterial
        ); // 立方体
        console.log(meshMaterial);

        console.log(meshMaterial);
        box.position.x = -1.2;
        mesh.position.x = 1.2;

        this.mesh = mesh;
        this.meshMaterial = meshMaterial;
        this.material = material;
        this.scene.add(box, mesh);
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
        const gui = new dat.GUI();

        gui.add(this.directionalLight.position, 'x', -10, 10, 0.1);
        gui.add(this.directionalLight.position, 'y', -10, 10, 0.1);
        gui.add(this.directionalLight.position, 'z', -10, 10, 0.1);

        const params = {
          gradientType: 'three', // 设置初始值
        };

        gui
          .add(params, 'gradientType', ['none', 'three', 'five'])
          .onChange((val) => {
            // 先克隆当前材质
            const newMaterial = this.mesh.material.clone();

            switch (val) {
              case 'none':
                newMaterial.gradientMap = null;
                break;
              case 'three':
                newMaterial.gradientMap = this.threeToneTexture;
                break;
              case 'five':
                newMaterial.gradientMap = this.fiveToneTexture;
                break;
            }

            // 销毁旧材质
            this.mesh.material.dispose();
            // 应用新材质
            this.mesh.material = newMaterial;
            // 强制更新
            this.mesh.material.needsUpdate = true;
          });
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
