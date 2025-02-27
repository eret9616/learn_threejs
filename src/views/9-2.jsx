import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import * as dat from 'dat.gui';
import gsap from 'gsap';

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

        const scene = new THREE.Scene();
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
        mesh.name = 'torus-mesh';
        this.scene.add(mesh);
      },
      createObjects() {
        const textureLoader = new THREE.TextureLoader();
        const texture = new THREE.TextureLoader().load(
          'src/assets/textures/Warning_Sign_HighVoltage_001/Warning_Sign_HighVoltage_001_basecolor.jpg'
        );
        texture.colorSpace = THREE.SRGBColorSpace;

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(4, 4, 4),
          new THREE.MeshLambertMaterial({
            map: texture,
          })
        );

        const geometry = new THREE.PlaneGeometry(10000, 10000);

        this.box = box;
        box.position.x = -3;
        box.position.y = 10;
        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(100, 100),
          new THREE.MeshBasicMaterial({
            color: 0xdce776,
            transparent: true,
            opacity: 0.5,
          })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1;

        gsap.to(box.position, {
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'none',
          x: 4,
        });

        this.scene.add(box, ground);
      },
      createCamera() {
        // 创建第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          10000
        );
        watcherCamera.position.set(4, 8, 20);
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
        boxFolder.add(_this.box.position, 'x', -20, 20, 0.1).onChange(() => {});
        // z
        boxFolder.add(_this.box.position, 'z', -20, 20, 0.1).onChange(() => {});
        boxFolder.open();
      },
      helpers() {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        const gridHelper = new THREE.GridHelper(100, 25, 0xff00ff);
        // 创建辅助平面
        gridHelper.position.y = -1.01;
        this.scene.add(axesHelper, gridHelper);
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
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(-1000, -1000),
      tick() {
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const objects = this.raycaster.intersectObjects([this.box]);

        // 重置所有物体的透明度
        this.box.material.transparent = false;
        this.box.material.opacity = 1;

        this.box.material.needsUpdate = true;

        // 更新 currentIntersect
        if (objects.length) {
          this.currentIntersect = objects[0];
        } else {
          this.currentIntersect = null;
        }

        // 只有当真正相交时才设置透明度
        const target = objects[0]?.object;
        if (target) {
          target.material.transparent = true;
          target.material.opacity = 0.5;
          target.material.needsUpdate = true;
        }

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
        this.loadTextures();
        this.createObjects();
        this.createCamera();
        this.helpers();
        this.render();
        this.controls();
        this.tick();
        this.fitView();
        this.datGui();

        window.addEventListener('mousemove', (e) => {
          this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1; // 0-2
          this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; // -1 1
          console.log(e.clientY / window.innerHeight);
        });

        window.addEventListener('pointerdown', (e) => {
          //   this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1; // 0-2
          //   this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1; // -1 1
          //   console.log(e.clientY / window.innerHeight);

          if (this.currentIntersect) {
            // console.log('currentIntersect:', this.currentIntersect);
            const box = this.currentIntersect.object;

            const boxCopy = new THREE.Mesh(
              new THREE.BoxGeometry(4, 4, 4),
              new THREE.MeshBasicMaterial({
                map: box.material.map,
              })
            );

            boxCopy.position.copy(box.position);

            this.scene.add(boxCopy);
            gsap.to(boxCopy.position, {
              duration: 1,
              y: 1,
            });
          }
        });
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
