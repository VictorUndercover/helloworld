// Configurar a cena, câmera e renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adicionar os controles de órbita após a câmera ser criada
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza os movimentos
controls.dampingFactor = 0.25; // Fator de suavização
controls.enableZoom = true;    // Permitir zoom
controls.autoRotate = false;   // Desativado por padrão, pode ser ligado se quiser rotação automática
controls.enablePan = true;     // Permitir que o usuário mova a câmera no plano

// Variáveis de controle de movimento
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3(); // Controla a velocidade da câmera
let direction = new THREE.Vector3(); // Direção de movimento
let moveSpeed = 0.1; // Ajusta a velocidade de movimento

// Detectar pressionamento de teclas
window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyS': // Avançar
      moveForward = true;
      break;
    case 'KeyW': // Recuar
      moveBackward = true;
      break;
    case 'KeyA': // Mover para a esquerda
      moveLeft = true;
      break;
    case 'KeyD': // Mover para a direita
      moveRight = true;
      break;
  }
});

// Detectar quando as teclas são soltas
window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyS':
      moveForward = false;
      break;
    case 'KeyW':
      moveBackward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
  }
});

// Função para mover a câmera
function moveCamera() {
  // Reseta a direção
  direction.set(0, 0, 0);

  // Atualiza a direção com base nas teclas pressionadas
  if (moveForward) direction.z = -1; // Z negativo para frente
  if (moveBackward) direction.z = 1; // Z positivo para trás
  if (moveLeft) direction.x = -1; // X negativo para a esquerda
  if (moveRight) direction.x = 1; // X positivo para a direita

  // Normaliza a direção para evitar que a velocidade varie conforme a diagonal
  direction.normalize();

  // Calcula o vetor de direção da câmera
  const cameraDirection = new THREE.Vector3();
  camera.getWorldDirection(cameraDirection); // Pega a direção da câmera no mundo

  // Movimenta a câmera para frente e para trás com base na direção da câmera
  if (moveForward || moveBackward) {
    velocity.z = direction.z * moveSpeed;
    camera.position.add(cameraDirection.multiplyScalar(velocity.z)); // Move para frente ou para trás
  }

  // Movimenta a câmera para os lados, independente da direção em que ela aponta
  if (moveLeft || moveRight) {
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, cameraDirection).normalize(); // Obtém a direção direita da câmera
    velocity.x = direction.x * moveSpeed;
    camera.position.add(right.multiplyScalar(velocity.x)); // Move para a esquerda ou direita
  }
}

// Posicionar a câmera
camera.position.y = 10;
camera.position.z = 25;

//Rotação da câmera
camera.rotation.x += 0.1;

// Criar a superfície (plano)
const planeGeometry = new THREE.PlaneGeometry(100, 100); // Plano grande
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide }); // Material básico, cor cinza
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotacionar para que fique na horizontal
scene.add(plane); // Adicionar à cena

// Criar um cubo
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

//Posicionar o cubo
cube.position.y = 2

// Adicionar o evento de clique
window.addEventListener('click', onClick, false);

// Criar o raycaster e o mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
  // Atualizar a posição do mouse com base no clique
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Configurar o raycaster com base na posição do mouse e da câmera
  raycaster.setFromCamera(mouse, camera);

  // Calcular os objetos que o raycaster intersecta
  const intersects = raycaster.intersectObjects(scene.children);

  // Verificar se o cubo foi clicado
  intersects.forEach(function (intersect) {
    if (intersect.object === cube) {
      console.log('Clique detectado no cubo!');
   
      // Atualizar o estado e a mensagem de Orion ao clicar no cubo
      updateOrionEstado('interagindo');
      responder('cripto');  // Exemplo: A pergunta será sobre criptomoedas
      atualizarInterface();  // Atualizar a interface com a resposta do Orion
      }
  });
}

// Criar a geometria da pirâmide (cone com base quadrada)
const pyramidGeometry = new THREE.ConeGeometry(7, 7, 4); // Base quadrada com 4 segmentos radiais

// Criar o material com cor amarela e transparência
const pyramidMaterial = new THREE.MeshBasicMaterial({
  color: 0xffff00, // Cor amarela
  transparent: true, // Permitir transparência
  opacity: 0.5, // Definir a opacidade (0.5 é semitransparente)
  side: THREE.DoubleSide // Renderizar ambos os lados da pirâmide
});

// Criar a malha (mesh) da pirâmide
const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
pyramid.position.y = 3.5; // Posicionar a base da pirâmide no plano (metade da altura)

// Adicionar a pirâmide à cena
scene.add(pyramid);

// Destacar as arestas da pirâmide
const edges = new THREE.EdgesGeometry(pyramidGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 }); // Arestas em amarelo
const wireframe = new THREE.LineSegments(edges, lineMaterial);

// Adicionar as arestas à cena
pyramid.add(wireframe);

// Criar estrelas no céu
function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.3, 24, 24); // Pequenos pontos de luz
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  
    for (let i = 0; i < 500; i++) { // 500 estrelas
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.x = (Math.random() - 0.5) * 400;
      star.position.y = Math.random() * 200 + 20;
      star.position.z = (Math.random() - 0.5) * 400;
      scene.add(star);
    }
  }
  
  createStars(); // Chamar a função para adicionar as estrelas

// Função para criar estrelas específicas para a constelação de Órion
function createOrion() {
    const orionStars = [
      { x: -20, y: 100, z: -60 },  // Betelgeuse
      { x: 20, y: 80, z: -80 },   // Rigel
      { x: 0, y: 60, z: -100 },    // Bellatrix
      { x: -10, y: 40, z: -120 },   // Mintaka (cinturão)
      { x: 0, y: 40, z: -130 },    // Alnilam (cinturão)
      { x: 10, y: 40, z: -140 },    // Alnitak (cinturão)
      { x: -4, y: 20, z: -160 }    // Saiph
    ];

    const starGeometry = new THREE.SphereGeometry(0.3, 24, 24); // Estrelas maiores para constelação
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Estrelas da constelação com cor amarela
  
    orionStars.forEach(starPos => {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(starPos.x, starPos.y, starPos.z);
      scene.add(star);
    });
  }
  
  createOrion(); // Adicionar a constelação de Órion

    // Criando um objeto Orion para armazenar as informações de interação
    const orion = {
        estado: 'inicial',
        mensagem: ''
    };
    
    // Função para atualizar o estado do Orion
    function updateOrionEstado(estado) {
        orion.estado = estado;
    }
    
    // Função para atualizar a mensagem do Orion
    function updateOrionMensagem(mensagem) {
        orion.mensagem = mensagem;
    }
    
    // Função para responder às perguntas e interações do usuário
    function responder(pergunta) {
        switch (orion.estado) {
        case 'inicial':
            updateOrionMensagem('Olá! Sou o Orion, aqui para ajudar.');
            break;
        case 'interagindo':
            // Verificando se a pergunta é sobre criptomoedas
            if (pergunta.includes('cripto')) {
            updateOrionMensagem('Ah, você está interessado em criptomoedas! Eu posso te ajudar com informações e dicas.');
            }
            // Verificando se a pergunta é sobre finanças
            else if (pergunta.includes('finanças')) {
            updateOrionMensagem('Sim, eu posso te ajudar com informações sobre finanças!');
            }
            // Caso contrário, respondendo com uma mensagem padrão
            else {
            updateOrionMensagem('Desculpe, não entendi sua pergunta. Por favor, tente novamente.');
            }
            break;
        }
    }
    
    // Função para atualizar a interface do usuário com as informações de interação
    function atualizarInterface() {
        // Atualizando o texto da mensagem
        document.getElementById('mensagem').innerHTML = orion.mensagem;
    }
        
// Função de animação
function animate() {
  requestAnimationFrame(animate);

  // Atualizar os controles
  controls.update();

  // Girar o cubo
  cube.rotation.x += 0.001;
  cube.rotation.y += 0.001;

  // Atualiza os controles da câmera
  moveCamera();

  renderer.render(scene, camera);
}

animate(); //iniciar animação