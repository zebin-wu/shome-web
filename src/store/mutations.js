import { set, toggle } from '@/utils/vuex'

export default {
  setDrawer: set('drawer'),
  toggleDrawer: toggle('drawer'),
  setSelRoom: set('selroom'),
  setSelScene: set('selScene')
}
