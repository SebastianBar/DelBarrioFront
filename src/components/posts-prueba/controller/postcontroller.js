import axios from 'axios'
import { globalConst } from '@/config/global.js'
import {Validator} from 'vee-validate'
import moment from 'moment'
import imagecontroller from '@/components/images/controller/imagecontroller'
import swal from 'sweetalert2'
Validator.installDateTimeValidators(moment)

export default {
  // Obtener categoria especifica según id.
  // Param.: context -> Contexto de la vista .vue, contiene los objetos instanciados en "data".
  // Return: Obtiene objeto de la categoría específica seleccionada en la vista "ListPosts"
  // =======================================================================================
  getPost (context) {
    axios.get(globalConst().localUrl + 'publicacion/' + context.$route.params.id + '/')
    .then(response => {
      context.post = response.data.data
    }).catch(errors => {
      console.log(errors)
    })
  },
  // Obtener todas las categorías de la api.
  // Param.: context -> Contexto de la vista .vue, contiene los objetos instanciados en "data".
  // Return: lista todas las publicaciones.
  // =======================================================================================
  listPosts (context) {
    axios.get(globalConst().localUrl + 'publicacion/')
    .then(response => {
      context.posts = response.data.data
    }).catch(errors => {
      console.log(errors)
    })
  },
  // Enviar POST request a la fuente.
  // Param.:       context -> Contiene los objetos instanciados en "data".
  // Return:       Retorna los datos del POST response por consola js.
  // Constraints:  post {
  //                      IDEN_TIPO_PUBLICACION: id (req)
  //                      IDEN_CATEGORIA:  id (req)
  //                      NOMB_PUBLICACION: string (req | len < 255)
  //                      DESC_PUBLICACION: string (req | len < 10.000)
  //                      NUMB_PRECIO: int (req | > 0)
  //                      FLAG_CONTENIDO_ADULTO: bool
  //                    }
  // =======================================================================================
  addPost (context, blob = undefined) {
    axios.post(
      globalConst().localUrl + 'publicacion/',
      {
        CODI_TIPO_PUBLICACION: context.post.CODI_TIPO_PUBLICACION,
        IDEN_CATEGORIA: context.post.IDEN_CATEGORIA,
        NOMB_PUBLICACION: context.post.NOMB_PUBLICACION,
        DESC_PUBLICACION: context.post.DESC_PUBLICACION,
        NUMR_PRECIO: parseInt(context.post.NUMR_PRECIO),
        FLAG_CONTENIDO_ADULTO: context.post.FLAG_CONTENIDO_ADULTO,
        IDEN_EMPRENDEDOR: 1
      }).then(response => {
        if (blob !== undefined) {
          imagecontroller.addPostImage(context, response.data.data.IDEN_PUBLICACION, blob)
        }
        if (context.selected) {
          console.log(new Date(context.sale.FECH_INICIO))
          this.addSale(context, response.data.data.IDEN_PUBLICACION)
          .then(response => {
            context.post = { FLAG_CONTENIDO_ADULTO: false }
          }).catch(errors => {
            context.error = 'Error inesperado al ingresar oferta'
          })
        }
        context.post = { FLAG_CONTENIDO_ADULTO: false }
      }).catch(errors => {
        console.log(errors + 'catch')
        context.error = 'Error inesperado al ingresar Publicación'
      })
  },
  addSale (context, id) {
    return axios.post(
      globalConst().localUrl + 'oferta/',
      {
        IDEN_PUBLICACION: parseInt(id),
        FECH_INICIO: moment(new Date(context.sale.FECH_INICIO)).toJSON(),
        FECH_TERMINO: new Date(context.sale.FECH_TERMINO).toJSON(),
        NUMR_PRECIO: parseInt(context.sale.NUMR_PRECIO)
      })
  },
  // =======================================================================================
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
  editPost (context, blob = undefined) {
    console.log(context)
    axios.put(
      globalConst().localUrl + 'publicacion/' + context.post.IDEN_PUBLICACION + '/',
      {
        CODI_TIPO_PUBLICACION: context.post.CODI_TIPO_PUBLICACION,
        IDEN_CATEGORIA: context.post.IDEN_CATEGORIA,
        NOMB_PUBLICACION: context.post.NOMB_PUBLICACION,
        DESC_PUBLICACION: context.post.DESC_PUBLICACION,
        NUMR_PRECIO: parseInt(context.post.NUMR_PRECIO),
        FLAG_CONTENIDO_ADULTO: context.post.FLAG_CONTENIDO_ADULTO,
        IDEN_EMPRENDEDOR: 1
      }).then(response => {
        if (blob !== undefined) {
          imagecontroller.addPostImage(context, response.data.data.IDEN_PUBLICACION, blob)
        }
        context.post = { FLAG_CONTENIDO_ADULTO: false }
      }).catch(errors => {
        context.error = 'Error inesperado al ingresar Publicación'
      })
  },
  deleteImage (id, context) {
    swal({
      title: '¿Estás seguro?',
      text: 'Si eliminas esta foto no podrás recuperarla luego.',
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      customClass: "'font-family: 'Rubik'"
    }).then(function (result) {
      if (result.dismiss === 'cancel') {
        swal(
          'Cancelado',
          'No se ha eliminado tu imagen',
          'error'
        )
      } else {
        axios.delete(
          globalConst().localUrl + 'imagen/' + id + '/'
        ).then(response => {
          swal(
            'Exito',
            'Tu imagen ha sido eliminada.',
            'success'
          )
          this.listPosts(context)
        }).catch(errors => {
          swal(
            'Mal',
            'Algo malo pasó.',
            'error'
          )
        })
      }
    })
  }
}