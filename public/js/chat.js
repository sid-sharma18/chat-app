const socket=io();
 //elements
 const messageForm=document.querySelector('#message-form')  
 const messageFormInput=messageForm.querySelector('#msg')
 const messageFormBtn=messageForm.querySelector('#btn')
const sendLocationBtn=document.querySelector('#send-location')
const messages=document.querySelector('#messages')
const roomName=document.querySelector('#roomname')




////templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML



const{username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})





socket.on('message',(str)=>{
    console.log(str)
    const html=Mustache.render(messageTemplate,{message:str.text,
        username:str.username,
    createdAt:moment(str.createdAt).format('h:mm a')})
    messages.insertAdjacentHTML('beforeend',html)
   
})

socket.on('LocationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationTemplate,{
        url:message.url,
        username:message.username,
    createdAt:moment(message.createdAt).format('h:mm a')})
    messages.insertAdjacentHTML('beforeend',html)
   })


socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room:room,
        users:users
    })
    document.querySelector('#sidebar').innerHTML=html

})


messageFormBtn.addEventListener('click',(e)=>{

    e.preventDefault()
    if(messageFormInput.value=="")
    {
       alert('Message cannot be empty') 
    }
    else{
    messageFormBtn.setAttribute('disabled','disabled')

    const message=messageFormInput.value
   //e.target.elements.message.value
    socket.emit('message-send',message,(error)=>{
        messageFormBtn.removeAttribute('disabled')
        if(error)
        {
         return   alert(error)
        }
        console.log('The message has been delivered')
    })
    messageFormInput.value=""
    messageFormInput.focus()
}
})
sendLocationBtn.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
       return alert('geolocation is not supported by your browser')
    }
    sendLocationBtn.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{
            
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            sendLocationBtn.removeAttribute('disabled')
                console.log('Location is shared!')
        })
       
        
    })
    
})

socket.emit('join',{username,room},(error)=>{
   if(error)
   {
    alert(error)
    location.href='/'
   }
})