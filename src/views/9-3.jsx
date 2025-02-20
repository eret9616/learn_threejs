import { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
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

        const ambient = new THREE.AmbientLight(0xffffff);
        const directionalLight = new THREE.DirectionalLight(0xffffff);

        directionalLight.position.set(5, 5, 2);

        //
        scene.add(ambient, directionalLight);
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
        box.position.x = -5;
        box.position.y = 1;

        // gsap.to(box.position, {
        //   duration: 1,
        //   repeat: 1,
        //   x: 4,
        // });

        const cube = new THREE.Mesh(
          new THREE.BoxGeometry(4, 4, 4),
          new THREE.MeshLambertMaterial({
            // map: texture,
            color: 0x1890ff,
          })
        );
        cube.position.x = 5;
        cube.position.y = 1;

        this.cube = cube;

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

        // gsap.to(box.position, {
        //   duration: 2,
        //   repeat: -1,
        //   yoyo: true,
        //   ease: 'none',
        //   x: 4,
        // });

        this.scene.add(box, ground, cube);
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

        // 控制环境光开启
        // const ambientFolder = gui.addFolder('环境光');
        // ambientFolder.add(this.ambientLight, 'visible').name('开启环境光');
        // ambientFolder.open();

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
      tick() {
        // 获取盒子的中心点坐标，clone()是为了创建一个新的向量副本，避免直接修改原始位置
        const centerCoord = this.box.position.clone();

        // geometry.attributes.position 包含了这个几何体所有顶点的坐标信息
        // 一个立方体有8个顶点，每个顶点有x,y,z三个坐标值
        const { position } = this.box.geometry.attributes;

        // 创建一个数组来存储所有顶点
        const vertices = [];
        // position.count 表示顶点的数量
        for (let i = 0; i < position.count; i++) {
          // 对于每个顶点，从geometry中获取它的x,y,z坐标
          // position.getX(i)获取第i个顶点的x坐标，以此类推
          // 创建一个新的三维向量来表示这个顶点
          vertices.push(
            new THREE.Vector3(
              position.getX(i), // 获取顶点的x坐标
              position.getY(i), // 获取顶点的y坐标
              position.getZ(i) // 获取顶点的z坐标
            )
          );
        }

        // 遍历所有顶点，为每个顶点创建一条射线
        for (let i = 0; i < vertices.length; i++) {
          // applyMatrix4将顶点坐标从局部坐标系转换到世界坐标系
          // matrixWorld是物体的世界变换矩阵，包含了位置、旋转、缩放等信息
          const worldCoord = vertices[i]
            .clone()
            .applyMatrix4(this.box.matrixWorld);

          // 计算从盒子中心到当前顶点的方向向量
          // sub()方法进行向量减法：顶点坐标 - 中心坐标 = 方向向量
          const dir = worldCoord.clone().sub(centerCoord);

          // 创建一个射线投射器
          // 参数1：射线起点（盒子中心）
          // 参数2：射线方向（归一化后的方向向量）
          const raycaster = new THREE.Raycaster(
            centerCoord,
            dir.clone().normalize() // normalize()将向量长度归一化为1
          );

          // 检测射线是否与蓝色立方体相交
          const intersects = raycaster.intersectObjects([this.cube], true);

          // 如果检测到相交
          if (intersects.length) {
            console.log(intersects);
            console.log('相交');
            // 打印相交点距离射线起点的距离，以及射线方向向量的长度
            console.log(intersects[0].distance, dir.length());
            const cube = intersects[0].object;

            // 如果相交点距离小于等于方向向量长度，说明发生了真实碰撞
            if (intersects[0].distance <= dir.length()) {
              cube.material.opacity = 0.5; // 设置立方体半透明
              cube.material.transparent = true; // 启用透明度
              this.flag = true; // 设置碰撞标志
            } else {
              cube.material.opacity = 1; // 恢复完全不透明
            }
            // 更新材质
            cube.material.needsUpdate = true;
          }
        }

        // 根据碰撞标志控制盒子运动
        if (!this.flag) {
          this.box.position.x += this.speedX; // 无碰撞时向右移动
        } else {
          this.box.position.x -= this.speedX; // 有碰撞时向左移动
        }

        // 当盒子移动到左边界时
        if (this.box.position.x <= -5) {
          this.flag = false; // 重置碰撞标志
        }

        // 更新轨道控制器
        this.orbitControls.update();
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
        // 请求下一帧动画
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
          //   console.log(e.clientY / window.innerHeight);
        });

        window.addEventListener('pointerdown', (e) => {
          //   if (this.currentIntersect) {
          //     const box = this.currentIntersect.object;
          //     const boxCopy = new THREE.Mesh(
          //       new THREE.BoxGeometry(4, 4, 4),
          //       new THREE.MeshLambertMaterial({
          //         map: box.material.map,
          //       })
          //     );
          //     boxCopy.position.copy(box.position);
          //     this.scene.add(boxCopy);
          //     gsap.to(boxCopy.position, {
          //       duration: 1,
          //       y: 1,
          //     });
          //   }
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
