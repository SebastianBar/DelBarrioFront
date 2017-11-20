import axios from 'axios'
import { CFG } from '~/controllers/_helpers'

// Obtener categoría especifica según id.
// Param.: context -> Contexto de la vista .vue, contiene los objetos instanciados en "data".
// Return: Promise
// =======================================================================================
function GET (id = undefined) {
  return axios.get(CFG.apiUrl + 'emprendedor/' + id)
    .then(res => {
      return {
        id: id,
        entrepreneur: res.data.data
      }
    }).catch(errors => {
      console.log(errors)
    })
}

function GETAll () {
  return axios.get(CFG.apiUrl + 'emprendedor')
    .then(response => {
      return {
        entrepreneurs: response.data.data
      }
    }).catch(errors => {
      console.log(errors)
    })
}

// Enviar POST request a la fuente.
// Param.:       context -> Contiene los objetos instanciados en "data".
// Return:       Retorna los datos del POST response por consola js.
// Constraints:  post {
//                      title: string (req | len < 255)
//                      body:  string (req | len < 255)
//                    }
// =======================================================================================
function POST (context) {
  if (RutValidation(context.entrepreneur.RUT_USUARIO)) {
    axios.post(
      CFG.apiUrl + 'usuario',
      {
        EMAIL_USUARIO: context.entrepreneur.EMAIL_USUARIO,
        DESC_PASSWORD: context.entrepreneur.DESC_PASSWORD,
        IDEN_ROL: 2
      }
    ).then(response => {
      console.log(response.data)
      axios.post(
        CFG.apiUrl + 'emprendedor',
        {
          IDEN_USUARIO: response.data.data.IDEN_USUARIO,
          DESC_EMPRENDEDOR: context.entrepreneur.DESC_EMPRENDEDOR,
          DESC_NOMBRE_FANTASIA: context.entrepreneur.DESC_NOMBRE_FANTASIA,
          DESC_NOMBRE_EMPRESA: context.entrepreneur.DESC_NOMBRE_EMPRESA,
          RUT_EMPRENDEDOR: parseInt(context.entrepreneur.RUT_EMPRENDEDOR.slice(0, -1)),
          DV_EMPRENDEDOR: context.entrepreneur.RUT_EMPRENDEDOR.slice(-1).toUpperCase()
        }
      ).then(response => {
        context.entrepreneur = {}
        context.message = 'Agregado exitosamente!'
      }).catch(errors => {
        console.log(errors.response)
        console.log(errors.request)
        context.message = 'Error inesperado'
      })
    }).catch(errors => {
      console.log(errors)
      console.log(errors)
      context.message = 'Error inesperado'
    })
  } else {
    context.message = 'Ingrese un rut válido'
  }
}

// Enviar PUT request a la fuente. Se utilizó placeholder.
// Param.:       context -> Contexto de la vista .vue, contiene los objetos instanciados en
//               "data".
// Return:       Retorna los datos del PUT response por consola js.
// Constraints:  post {
//                      title:  string (req | len < 255)
//                      body:   string (req | len < 255)
//                      userId: int (req | user-exists)
//                      id:     int (req | post-exists)
//                    }
// =======================================================================================
function PUT (context) {
  axios.put(
    CFG.apiUrl + 'emprendedor/' + context.id,
    {
      DESC_EMPRENDEDOR: context.entrepreneur.DESC_EMPRENDEDOR,
      DESC_NOMBRE_FANTASIA: context.entrepreneur.DESC_NOMBRE_FANTASIA,
      DESC_NOMBRE_EMPRESA: context.entrepreneur.DESC_NOMBRE_EMPRESA,
      RUT_EMPRENDEDOR: parseInt(context.rut.slice(0, -1)),
      DV_EMPRENDEDOR: context.rut.slice(-1).toUpperCase()
    }
  ).then(response => {
    context.message = 'Editado exitosamente!'
  }).catch(errors => {
    context.message = errors.response.data.data.message ? errors.response.data.data.message : 'Error inesperado'
  })
}

// comentarios
function setState (category) {
  axios.put(
    CFG.apiUrl + 'categoria/' + category.IDEN_CATEGORIA,
    {
      FLAG_VIGENTE: !category.FLAG_VIGENTE
    }
  ).then(response => {
    category.FLAG_VIGENTE = !category.FLAG_VIGENTE
  }).catch(errors => {
    console.log(errors)
  })
}

function RutValidation (Objeto) {
  if (Objeto != null) {
    var tmpstr = ''
    var intlargo = Objeto
    if (intlargo.length > 0) {
      var crut = Objeto
      var largo = crut.length
      if (largo < 2) {
        return false
      }
      for (var i = 0; i < crut.length; i++) {
        if (crut.charAt(i) !== ' ' && crut.charAt(i) !== '.' && crut.charAt(i) !== '-') {
          tmpstr = tmpstr + crut.charAt(i)
        }
      }
      var rut = tmpstr
      crut = tmpstr
      largo = crut.length
      if (largo > 2) {
        rut = crut.substring(0, largo - 1)
      } else {
        rut = crut.charAt(0)
      }
      var dv = crut.charAt(largo - 1)
      if (rut === null || dv === null) {
        return 0
      }
      var dvr = '0'
      var suma = 0
      var mul = 2
      for (i = rut.length - 1; i >= 0; i--) {
        suma = suma + rut.charAt(i) * mul
        if (mul === 7) {
          mul = 2
        } else {
          mul++
        }
      }
      var res = suma % 11
      if (res === 1) {
        dvr = 'k'
      } else {
        if (res === 0) {
          dvr = '0'
        } else {
          var dvi = 11 - res
          dvr = dvi + ''
        }
      }
      if (dvr !== dv.toLowerCase()) {
        return false
      }
      return true
    }
  }
}

export default {
  GET,
  GETAll,
  POST,
  PUT,
  setState,
  RutValidation
}