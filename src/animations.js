
export default function makeAnimations(scene) {
    let config = {
        key: 'flower_attack_right',
        frames: scene.anims.generateFrameNumbers('tiles', {
            start: 60,
            end: 79,
            first: 60
        })
    };
    scene.anims.create(config);
    config = {
        key: 'flower_attack_left',
        frames: scene.anims.generateFrameNumbers('tiles', {
            start: 80,
            end: 99,
            first: 80
        })
    };
    scene.anims.create(config);

}