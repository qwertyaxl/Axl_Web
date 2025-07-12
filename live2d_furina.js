(async function () {
    const container = document.getElementById('live2d-container');
    const toggleButton = document.getElementById('toggle-follow');
    let notFollowingMouse = true;

    const app = new PIXI.Application({
        view: document.getElementById('live2d-canvas'),
        autoStart: true,
        resizeTo: container,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
    });

    const modelUrl = './Furina/Furina/Furina.model3.json';
    const model = await PIXI.live2d.Live2DModel.from(modelUrl, { autoInteract: false });
    app.stage.addChild(model);

    let lastExpressionParams = [];
    let index = 0;

    model.scale.set(0.15);
    model.anchor.set(0.5, 0.5);
    model.position.set(container.offsetWidth / 2, container.offsetHeight / 2 + 50);

    function updateGaze(mouseX, mouseY) {
        const maxAngleX = 30;
        const maxAngleY = 20;
        const weight = 0.5;

        const canvasRect = app.view.getBoundingClientRect();
        const modelCenterX = canvasRect.left + model.position.x;
        const modelCenterY = canvasRect.top + model.position.y;

        const deltaX = mouseX - modelCenterX;
        const deltaY = mouseY - modelCenterY;

        const angleX = (deltaX / (canvasRect.width / 2)) * maxAngleX;
        const angleY = (deltaY / (canvasRect.height / 2)) * -maxAngleY;

        model.internalModel.coreModel.setParameterValueById('ParamAngleX', angleX, weight);
        model.internalModel.coreModel.setParameterValueById('ParamAngleY', angleY * 0.9, weight);
        model.internalModel.coreModel.setParameterValueById('ParamEyeBallX', angleX / 10, weight);
        model.internalModel.coreModel.setParameterValueById('ParamEyeBallY', angleY / 10, weight);
        model.internalModel.coreModel.setParameterValueById('ParamMouthForm', 1, weight);
        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 1, weight);
    }

    function resetGaze() {
        model.internalModel.coreModel.setParameterValueById('ParamAngleX', 0);
        model.internalModel.coreModel.setParameterValueById('ParamAngleY', 0);
        model.internalModel.coreModel.setParameterValueById('ParamEyeBallX', 0);
        model.internalModel.coreModel.setParameterValueById('ParamEyeBallY', 0);
        model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', 0);
        model.internalModel.coreModel.setParameterValueById('ParamMouthForm', 0);
        lastExpressionParams.forEach(param => {
            model.internalModel.coreModel.setParameterValueById(param.Id, 0);
        });
    }

    toggleButton.addEventListener('click', () => {
        notFollowingMouse = !notFollowingMouse;
        toggleButton.textContent = notFollowingMouse ? 'Aktifkan Ikuti Kursor' : 'Matikan Ikuti Kursor';
        if (notFollowingMouse) resetGaze();
    });

    document.addEventListener('pointermove', (event) => {
        if (!notFollowingMouse) {
        updateGaze(event.clientX, event.clientY);
        }
    });

    window.setExpression = async function (name) {
        if (name === 'reset') {
            resetGaze();
            lastExpressionParams = [];
            return;
        }
        const baseDir = modelUrl.substring(0, modelUrl.lastIndexOf('/') + 1);
        const fullPath = `${baseDir}Exp/${name}.exp3.json`;
        const response = await fetch(fullPath);
        const json = await response.json();
        applyExpressionManually(json);
    };

    function applyExpressionManually(json) {
        lastExpressionParams.forEach(param => {
            model.internalModel.coreModel.setParameterValueById(param.Id, 0);
        });

        json.Parameters.forEach(param => {
            model.internalModel.coreModel.setParameterValueById(param.Id, param.Value);
        }); 
        lastExpressionParams = json.Parameters;
    }

    app.view.addEventListener('click', (event) => {
        const rect = app.view.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const modelX = model.position.x;
        const modelY = model.position.y;
        const width = model.width;
        const height = model.height;

        const hitAreaWidth = 200;
        const hitAreaHeight = 300;

        const exp = ['-_-', '0_0', 'BuOu', 'HaiXiu', 'HeiLian', 'O', 'XingXing', 'reset'];
        const expDefs = exp.map(name => ({ Name: name }));
        
        if (
            mouseX >= modelX - hitAreaWidth / 2 &&
            mouseX <= modelX + hitAreaWidth / 2 &&
            mouseY >= modelY - hitAreaHeight / 2 &&
            mouseY <= modelY + hitAreaHeight / 2
        ) {
            const ExpName = expDefs[index].Name;
            setExpression(ExpName);
            console.log(`Ekspresi "${ExpName}"`);
            index = (index + 1) % 8;
        }
    });
})();
