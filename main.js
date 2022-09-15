const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const score = document.querySelector("#score")
const scoreModal = document.querySelector("#scoreModal")
const startModal = document.querySelector("#modal")
const startGameBtn = document.querySelector("#startGameBtn")

class Player {
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
             0, Math.PI*2, true)
        c.fillStyle = this.color
        c.fill() 
    }
}

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
             0, Math.PI*2, true)
        c.fillStyle = this.color
        c.fill() 
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y

    }
}

class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
             0, Math.PI*2, true)
        c.fillStyle = this.color
        c.fill() 
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y

    }
}

const friction = 0.99
class EnemyBurstParticles{
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    
    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius,
             0, Math.PI*2, true)
        c.fillStyle = this.color
        c.fill() 
        c.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}


const x = canvas.width / 2
const y = canvas.height / 2
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let scoreCount = 0

function init(){
     player = new Player(x, y, 10, 'white')
     projectiles = []
     enemies = []
     particles = []
     scoreCount = 0
     score.innerHTML = scoreCount
     scoreModal.innerHTML = scoreCount
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (30-5) + 5
        
        let x
        let y
        if( Math.random() > 0.5 ){
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
        y = Math.random() * canvas.height 
        }
        else{
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        x = Math.random() * canvas.width
        }
        
        const color = `hsl(${Math.random()*360},50%,50%)`
        const angle = Math.atan2(
            -y + canvas.height/2,
            -x + canvas.width/2,
        )
        const velocity = {
            x: Math.cos(angle), y: Math.sin(angle)
        }
    enemies.push(new Enemy(x,y,radius,color,velocity))
    console.log(enemies)
    },1000)
}

let animationId 
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw() 

    particles.forEach((particle,index) => {
        particle.update()
        if(particle.alpha <=0)
        {
            particles.splice(index,1)
        }
        else
        {
            particle.update()
        }
    });

    projectiles.forEach((projectile, index) =>
        {
            projectile.update()
            if (projectile.x - projectile.radius<0 || 
                projectile.x + projectile.radius>canvas.width ||
                projectile.y - projectile.radius<0 ||
                projectile.y + projectile.radius>canvas.height) {
                setTimeout(() => {
                    projectiles.splice(index,1)
                }, 0);
            }
        })

    enemies.forEach((enemy,index) =>
        {
            enemy.update()
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
                if (dist - enemy.radius - player.radius < 1) 
                {
                cancelAnimationFrame(animationId)
                startModal.style.display = 'flex'
                scoreModal.innerHTML = scoreCount    
                }
            
            projectiles.forEach((projectile,projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
                
                if (dist - enemy.radius - projectile.radius < 1) 
                {   
                    for (let i = 0; i < enemy.radius*2; i++) {
                        particles.push(new 
                        EnemyBurstParticles
                        (projectile.x,
                        projectile.y,
                        Math.random()*2,
                        enemy.color,
                        {
                        x: (Math.random()-0.5)*(Math.random()*6),
                        y: (Math.random()-0.5)*(Math.random()*6)
                        }
                        ))  
                    }
                    if (enemy.radius - 10 > 7 ) {
                        scoreCount += 100
                        score.innerHTML = scoreCount    
                        gsap.to(enemy,{radius: enemy.radius-10})
                        setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)   
                        }, 0);
                    }
                    else
                    {
                        scoreCount += 250
                        score.innerHTML = scoreCount 
                        setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)   
                        }, 0); 
                    }
                }
            
            });
        })

}


window.addEventListener('click', (event) => {
    const angle = Math.atan2(
    event.clientY - canvas.height/2,
    event.clientX - canvas.width/2,
    )
    const velocity = {
    x: Math.cos(angle)*5, y: Math.sin(angle)*5
    }
    projectiles.push( new Projectile(
    canvas.width/2 ,canvas.height/2, 5,
    'white',velocity
    ))
})

startGameBtn.addEventListener('click' , () => {
    init()
    animate()
    spawnEnemies()    
    startModal.style.display = 'none'
})
