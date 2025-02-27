import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
// PointerLockControls
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import * as dat from 'dat.gui';
import gsap from 'gsap';

const Page = () => {
  useEffect(() => {
    let sound;
    const move = {
      up: false,
      down: false,
      waiting: false,
      lock: false,
      touched: false,
      stoped: false,
    };
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
        // scene.background = new THREE.Color(0xe0e0e0);
        this.scene = scene;

        const ambient = new THREE.AmbientLight(0xffffff);
        const directionalLight = new THREE.DirectionalLight(0xffffff);

        directionalLight.position.set(5, 8, 10);
        directionalLight.castShadow = true;
        const dirLightHelper = new THREE.DirectionalLightHelper(
          directionalLight,
          3
        );
        this.dirLight = directionalLight;
        this.dirLightHelper = dirLightHelper;

        //
        //
        scene.add(ambient, directionalLight, dirLightHelper);
      },
      createLights() {
        // 添加全局光照
        // const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        // ambientLight.visible = true;
        // this.ambientLight = ambientLight;
        // this.scene.add(ambientLight);
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
      loadAudio() {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        sound = new THREE.Audio(listener);
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load('public/models/sounds/ding.m4a', (buffer) => {
          sound.setBuffer(buffer);
          sound.setPlaybackRate(4);
          sound.setVolume(0.5);
          //   sound.play();
        });
      },
      createObjects() {
        const texture = new THREE.TextureLoader().load(
          'public/models/textures/monastery_stone_floor_diff_2k.jpg'
        );
        texture.colorSpace = THREE.SRGBColorSpace;

        const ground = new THREE.Mesh(
          new THREE.BoxGeometry(100, 4, 100),
          new THREE.MeshLambertMaterial({
            map: texture,
          })
        );
        ground.position.z = 30;
        ground.position.y = -2;
        ground.receiveShadow = true;
        //

        const map = new THREE.TextureLoader().load(
          'public/models/textures/decorative-4813.jpg'
        );
        map.colorSpace = THREE.SRGBColorSpace;

        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(2, 64, 64),
          new THREE.MeshLambertMaterial({ map })
        );
        sphere.name = 'sphere';
        sphere.castShadow = true;
        sphere.position.y = 2;
        sphere.position.z = 12;
        this.sphere = sphere;
        this.dirLight.target = sphere;

        this.scene.add(ground, sphere);

        // bridge
        this.createBridge(texture);

        // opposite
        const opposite = new THREE.Mesh(
          new THREE.BoxGeometry(50, 4, 100),
          new THREE.MeshLambertMaterial({ map: texture })
        );

        opposite.position.z = -150;
        opposite.position.y = -2;
        opposite.receiveShadow = true;

        this.scene.add(opposite);
      },
      // 创建桥梁
      createBridge(texture) {
        const group = new THREE.Group();
        for (let i = 0; i < 8; i++) {
          const tile = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            new THREE.MeshLambertMaterial({ map: texture })
          );
          tile.position.z = 10 * i;
          tile.position.y = -20;
          group.position.z = -95;
          group.add(tile);
        }

        this.scene.add(group);
        this.group = group;

        return group;
      },
      createCamera() {
        // 创建第二个相机
        const watcherCamera = new THREE.PerspectiveCamera(
          75,
          this.width / this.height,
          0.1,
          10000
        );
        watcherCamera.position.set(4, 14, 10);
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
      },
      helpers() {
        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper();
        const gridHelper = new THREE.GridHelper(100, 25, 0xff00ff);
        // 创建辅助平面
        gridHelper.position.y = -1.01;
        // this.scene.add(axesHelper, gridHelper);
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

        const pointerLockControls = new PointerLockControls(
          this.camera,
          this.canvas
        );
        this.pointerLockControls = pointerLockControls;

        const dragControls = new DragControls(
          [this.box],
          this.camera,
          this.canvas
        );
        this.dragControls = dragControls;

        dragControls.addEventListener('dragstart', (e) => {
          orbitControls.enabled = false;
        });
        dragControls.addEventListener('dragend', (e) => {
          orbitControls.enabled = true;
        });
      },
      pointer: new THREE.Vector2(-1000, -1000),
      flag: false, // 是否碰撞
      speedX: 0.1, // 横向运动的距离
      clock: new THREE.Clock(),
      tick() {
        const _this = this;
        const timeDelta = this.clock.getDelta();
        const distance = timeDelta * 10;

        if (move.waiting) {
          if (!move.lock) {
            move.lock = true;
            // 如果移动到了桥面
            const start = gsap.to(_this.camera.position, {
              duration: 1.5,
              x: 120,
              y: -15,
              z: -60,
              onUpdate() {
                _this.camera.lookAt(new THREE.Vector3(0, -20, -60));
              },
              onReverseComplete() {
                move.waiting = false;
                move.stoped = true;
              },
            });

            const tl = gsap.timeline({ delay: 1.5 });

            _this.group.children.forEach((mesh, index) => {
              tl.to(mesh.position, {
                duration: 1,
                delay: -0.7,
                y: -5,
                keyframes: {
                  '90%': {
                    onComplete() {
                      //
                      sound.play();
                    },
                  },
                },
                onComplete() {
                  if (index === _this.group.children.length - 1) {
                    // 执行完所有动画
                    // 倒转动画
                    start.reverse();
                  }
                },
              });
            });
          }
        } else {
          if (move.up) {
            this.sphere.position.z -= distance;
            this.dirLight.position.z -= distance;
            this.pointerLockControls.moveForward(distance);
            if (this.sphere.position.z <= -6 && !move.stoped) {
              move.waiting = true;
            }
          } else if (move.down) {
            this.sphere.position.z += distance;
            this.dirLight.position.z += distance;
            this.pointerLockControls.moveForward(-distance);
          }
        }

        this.dirLightHelper.update();
        // 更新轨道控制器
        // this.orbitControls.update();
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
        // 请求下一帧动画
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
        const starter = document.getElementById('instructions');
        starter.addEventListener('click', () => {
          move.touched = true;
          starter.style.display = 'none';
          this.loadAudio();
        });

        // 键盘按下事件
        document.onkeydown = (e) => {
          if (!move.touched) {
            return;
          }
          switch (e.code) {
            case 'ArrowUp':
              // 前进
              move.up = true;
              break;
            case 'ArrowDown':
              move.down = true;
              // 后退
              break;
          }
        };

        // 键盘松开事件
        document.onkeyup = (e) => {
          if (!move.touched) {
            return;
          }
          switch (e.code) {
            case 'ArrowUp':
              move.up = false;
              break;
            case 'ArrowDown':
              move.down = false;
              break;
          }
        };
      },
    };
    $.init();
  }, []);

  return (
    <>
      <canvas id="c"></canvas>
      <div
        id="instructions"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          color: '#FFFFFF',
          backgroundColor: 'rgba(0,0,0,0.2)',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          fontSize: 14,
        }}
      >
        <p style={{ fontSize: 36, cursor: 'pointer' }}>点击开始</p>
      </div>
    </>
  );
};

export default Page;
