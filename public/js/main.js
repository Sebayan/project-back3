const sessionUserHtmlElement = document.querySelector('#sessionUser')
const productListHtmlElement = document.querySelector('#productList')
const registerFormHtmlElement = document.querySelector('#registerForm')

async function main(){
  const userData = await userLogged()
  
  if ( Object.keys(userData).length != 0 ) {
    const productsData = await allProducts()
    logged( userData[0], productsData )
    
  } else {
    sessionUserHtmlElement.innerHTML = loginTemplate()
    const logUser = document.getElementById("logUser")
    const logPassword = document.getElementById("logPassword")
   
    document.getElementById("loginBtn").addEventListener("click", ev => { 
      if ( validateObject ({ usuario: logUser.value , clave: logPassword.value })) {
        toast('Debe completar todos los datos', "#f75e25", "#ff4000")
      
      } else {    
        fetch(`http://localhost:${location.port}/session/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: logUser.value,
            password: logPassword.value
          })
        })
        .then((response) => response.json())
        .then(async (data) => {
          if ( Object.keys(data).length === 0){
            toast("Error de autenticacion", "#f75e25", "#ff4000")
          } else {
            const productsData = await allProducts()
            logged ( data[0], productsData )
          }
        }) 
         
        .catch(error => {
          toast("Error de autenticacion", "#f75e25", "#ff4000")
          console.error('Se produjo un error: ', error)
        })
      }
    })
    
    document.getElementById("registerBtn").addEventListener("click", ev => {
      registerNewUser(sessionUserHtmlElement)
    }) 

  }
}


main()