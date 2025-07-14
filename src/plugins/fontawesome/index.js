import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline,
  faPenToSquare,
  faEnvelope,
  faStar,
  faPaperPlane,
  faFile,
  faTrash,
  faFolder,
  faSearch,
  faPlus,
  faDumpster
} from '@fortawesome/free-solid-svg-icons'

// 添加图标到库
library.add(
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline,
  faPenToSquare,
  faEnvelope,
  faStar,
  faPaperPlane,
  faFile,
  faTrash,
  faFolder,
  faSearch,
  faPlus,
  faDumpster
)

// 导出图标组件
export { FontAwesomeIcon }

// 导出图标，方便直接使用
export const icons = {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faBold,
  faItalic,
  faUnderline,
  faPenToSquare,
  faEnvelope,
  faStar,
  faPaperPlane,
  faFile,
  faTrash,
  faFolder,
  faSearch,
  faPlus,
  faDumpster
}

// 导出插件
export default {
  install: (app) => {
    app.component('font-awesome-icon', FontAwesomeIcon)
  }
}
