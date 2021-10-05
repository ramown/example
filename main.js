const BASE_URL = "https://customizer-data.s3.us-west-1.amazonaws.com";
const MODELS = `${BASE_URL}/models`;
const LOGO_SVG = `${BASE_URL}/imgs/logo/tidelli.svg`;
const URL_TEXTURES = `${BASE_URL}/imgs/textures`;
const ENVIRONMENT_TEXTURES = `${URL_TEXTURES}/environments`;
const MATERIALS_TEXTURES = `${URL_TEXTURES}/materials`;

let updateMaterialF;

const canvas = document.getElementById("renderCanvas");
const barProgress = document.getElementById("barProgress");

const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    adaptToDeviceRatio: true
});

const loadingScreenDiv = document.getElementById("loadingScreen");

function customLoadingScreen() {
}
customLoadingScreen.prototype.displayLoadingUI = function () {
};
customLoadingScreen.prototype.hideLoadingUI = function () {
    loadingScreenDiv.style.display = "none";
};
const loadingScreen = new customLoadingScreen();
engine.loadingScreen = loadingScreen;

engine.displayLoadingUI();

const logo = document.getElementsByClassName('loadingscreen-logo-tidelli')[0];
logo.src = LOGO_SVG;

function createScene(){
    const selectFabrics = document.getElementById('select-fabric');
    const selectMetal = document.getElementById('select-metal');
    const selectWood = document.getElementById('select-wood');

    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.99,0.99,0.99);

    const camera = new BABYLON.ArcRotateCamera("camera", 1.05, 1.16, 1.5, new BABYLON.Vector3(0, 0, 0));
    camera.panningSensibility = 1000;
    camera.lowerBetaLimit = 0;
    camera.lowerRadiusLimit = 0.2;
    camera.upperRadiusLimit = 3.5;
    camera.upperBetaLimit = Math.PI/2;
    camera.attachControl(canvas, true);
    camera.minZ = 0.01
    camera.target = new BABYLON.Vector3(0.0,0.4,0.0);
    camera.wheelPrecision = 300;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light.intensity = 2;

    loadModel();

    return scene;

    function updateMaterial(nameMaterial, newTexture){
        let texture_name = `baseTexture_${nameMaterial}`;
        scene.textures.forEach((texture) => {
            if(texture.name === texture_name){
                let index = scene.textures.indexOf(texture);
                if(index > -1){
                    scene.textures.splice(index, 1);
                    let texture = new_texture(`ropes/${newTexture}`,"basecolor.jpg", scene);
                    texture.name = texture_name;
                    scene.getMaterialByID(nameMaterial).baseTexture = texture;
                }
            }
        });
    }

    updateMaterialF = updateMaterial;
    function resetTextures(){
        scene.textures = [];
        var hdrTexture = new BABYLON.CubeTexture.CreateFromPrefilteredData(`${ENVIRONMENT_TEXTURES}/environment.env`, scene);
        hdrTexture.name = 'HDR';
        scene.environmentTexture = hdrTexture;
    }

    function resetMaterials(){
        scene.materials = [];
    }

    function new_texture (path, filename) {
        return new BABYLON.Texture(`${MATERIALS_TEXTURES}/${path}/${filename}`, scene);
    }

    function resetMeshes(){
        scene.meshes = [];
    }

    function criarMatrizDeMateriais(){
        resetMaterials();
        resetTextures();
        //Woods
        let woods = new BABYLON.PBRMetallicRoughnessMaterial("woods", scene);
        woods.normalTexture = new_texture(`woods/01`,"normal.jpg", scene);
        // woods.invertNormalMapX = true;
        woods.normalTexture.name = `normalTexture_woods`;
        woods.baseTexture = new_texture(`woods/01`,"basecolor.jpg", scene);
        woods.baseTexture.name = `baseTexture_woods`;
        woods.metallicRoughnessTexture = new_texture(`woods/01`,"roughness.jpg", scene);
        woods.metallicRoughnessTexture.name = `metallicRoughnessTexture_woods`;
        //Metal
        let metal = new BABYLON.PBRMetallicRoughnessMaterial("metal", scene);
        metal.normalTexture = new_texture(`metal/01`,"normal.jpg", scene);
        // metal.invertNormalMapX = true;
        metal.normalTexture.name = `normalTexture_metal`;
        metal.baseTexture = new_texture(`metal/01`,"basecolor.jpg", scene);
        metal.baseTexture.name = `baseTexture_metal`;
        metal.metallicRoughnessTexture = new_texture(`metal/01`,"roughness.jpg", scene);
        metal.metallicRoughnessTexture.name = `metallicRoughnessTexture_metal`;
        //Fabric
        let fabric = new BABYLON.PBRMetallicRoughnessMaterial("fabrics", scene);
        fabric.normalTexture = new_texture(`fabrics/102`,"normal.jpg", scene);
        // fabric.invertNormalMapX = true;
        fabric.normalTexture.name = `normalTexture_fabrics`;
        fabric.baseTexture = new_texture(`fabrics/102`,"basecolor.jpg", scene);
        fabric.baseTexture.name = `baseTexture_fabrics`;
        fabric.metallic = 0
        fabric.roughness = .8
    }

    //END UPDATE MATERIAL

    function loadModel(){
        resetMeshes();
        criarMatrizDeMateriais();

        BABYLON.SceneLoader.ImportMesh("", `${MODELS}/`, `poltrona_otho.glb`, scene,(meshes) => {   
            
            meshes.forEach(mesh => {
                if(mesh.name !== '__root__'){
                    console.log(mesh.name)
                    if(mesh.name === "wood"){
                        mesh.material = scene.getMaterialByID(`${mesh.name}s`);
                    } else if (mesh.name.includes("fabric")) {
                        mesh.material = scene.getMaterialByID(`fabrics`);
                    } else {
                        mesh.material = scene.getMaterialByID(`${mesh.name}`);
                    }
                    
                }
            });

            engine.hideLoadingUI();
        },
            (value) => {
                let {loaded, total} = value;
                let width = (100*(loaded/total)).toFixed(0)+'%'
                barProgress.style.width = width;
            }
        );
    }
    
    selectFabrics.addEventListener('change', (evt) => {
        let index = evt.target.selectedIndex;
        let material = evt.target[index].dataset['material'];
        let value = evt.target[index].value;
        scene.updateMaterial(material, value);
    });
    
    selectMetal.addEventListener('change', (evt) => {
        let index = evt.target.selectedIndex;
        let material = evt.target[index].dataset['material'];
        let value = evt.target[index].value;
        scene.updateMaterial(material, value);
    });
    
    selectWood.addEventListener('change', (evt) => {
        let index = evt.target.selectedIndex;
        let material = evt.target[index].dataset['material'];
        let value = evt.target[index].value;
        scene.updateMaterial(material, value);
    });

}


const scene = createScene();


engine.runRenderLoop(function () {
    scene.render();
});
window.addEventListener("resize", function () {
    engine.resize();
});