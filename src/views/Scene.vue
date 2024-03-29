<template>
  <v-container
    fill-height
    fluid
    grid-list-xl
    style="margin-top: -32px"
  >
    <v-window
      v-model="window"
      style="width: 100%"
    >
    <v-window-item :value="0"></v-window-item>
    <v-window-item :value="1">
      <v-layout
        wrap
      >
        <v-flex
          v-for="set in setlist"
          :key="set.id"
          sm12
          xs12
          md6
          lg6
          style="padding-top: 0px; padding-bottom: 0px"
        >
          <material-card
            :color="color"
            style="margin-bottom:0px; padding-bottom:0px"
          >
            <div slot="header">
              <div
                style="flex: 1 1 100%; height: 45px; margin-top: -15px"
              >
                <span class="title font-weight-light mb-2" v-text="set.name"></span>
                <v-btn
                  flat
                  icon
                  style="margin-bottom: 15px"
                  @click.prevent="onClickModName(set)"
                >
                  <v-icon size="16" >mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  flat
                  icon
                  style="margin-bottom: 15px"
                  @click.prevent="onClickEnableSet(set)"
                >
                  <v-icon size="24" >mdi-play</v-icon>
                </v-btn>
                <v-btn
                  dark
                  icon
                  flat
                  style="float: right"
                  @click.prevent="delSet(set)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn
                  flat
                  icon
                  style="float:right"
                  @click.prevent="addTask(set)"
                >
                  <v-icon size="24">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>
            <v-data-table
              :headers="headers"
              :items="set.tasklist"
              hide-actions
            >
              <template
                slot="headerCell"
                slot-scope="{ header }"
              >
                <span
                  class="subheading font-weight-light text-success text--darken-3"
                  v-text="$t(header.text)"
                />
              </template>
              <template
                slot="items"
                slot-scope="{ item }"
              >
                <td> {{ getItemById(devlist, item.devid).name + '(' + getRoomNameById(roomlist, getItemById(devlist, item.devid).roomid, $t('no room set up')) + ')'}} </td>
                <td>
                  <v-icon>
                    {{ getIconColorItem(getItemById(devlist, item.devid).type).icon }}
                  </v-icon>
                </td>
                <td> {{ item.key.name + ':' + item.key.value }} </td>
                <td>
                  <v-btn
                    icon
                    flat
                    style="float: right; margin:0px"
                    @click.prevent="modTask(set, item)"
                  >
                    <v-icon color="tertiary">mdi-pencil-outline</v-icon>
                  </v-btn>
                </td>
                <td>
                  <v-btn
                    icon
                    flat
                    style="float: right; margin:0px"
                    @click.prevent="delTask(set, item.idx)"
                  >
                    <v-icon color="tertiary">mdi-delete-outline</v-icon>
                  </v-btn>
                </td>
              </template>
              <template v-slot:no-data>
                <H4 class="text-xs-center">{{ $t('no devices') }}</H4>
              </template>
            </v-data-table>
          </material-card>
        </v-flex>
      </v-layout>
    </v-window-item>
    </v-window>

    <dialog-setname
      :dialog="dialog_name"
      @toCloseDialog="dialog_name = false"
      @toModName="modName"
      :srcName="editObj.name"
      :title="$t('modify name')"
    >
    </dialog-setname>
    <dialog-settask
      :dialog="dialog_task"
      @toCloseDialog="dialog_task = false"
      @toSetTask="setTask"
      :srcTask="editTask"
      :title="$t(dialog_taskTitle)"
    >
    </dialog-settask>
  </v-container>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import webMethods from '@/utils/web-method'
import WEB from '@/utils/web-enum'
import { getIconColorItem } from '@/utils/dev'
import common from '@/utils/common'

export default {
  data () {
    return {
      dialog_name: false,
      dialog_task: false,
      dialog_taskTitle: '',
      editObj: {},
      editTask: {},
      headers: [
        {
          sortable: false,
          text: 'dev',
          value: 'name'
        },
        {
          sortable: false,
          text: 'type',
          value: 'type'
        },
        {
          sortable: false,
          text: 'task',
          value: 'task'
        },
        {
          sortable: false,
          text: 'modify',
          value: 'modify',
          align: 'right'
        },
        {
          sortable: false,
          text: 'delete',
          value: 'delete',
          align: 'right'
        }
      ],
      items: []
    }
  },
  computed: {
    ...mapState(['todolist', 'setlist', 'selScene', 'color', 'devlist', 'roomlist']),
    window: {
      get () {
        return this.selScene === 'todo' ? 0 : 1
      },
      set (val) {
        this.setSelScene(val == 0 ? 'todo' : 'set')
      }
    }
  },
  methods: {
    ...mapMutations('websocket', ['sendToServer']),
    ...mapMutations(['setSelScene']),
    onClickModName (obj) {
      this.dialog_name = true
      this.editObj = obj
    },
    onClickEnableSet(set) {
      this.sendToServer(webMethods.packageMsg(WEB.method.set, WEB.type.set, {
        id: set.id,
        who: "enable",
        what: {}
      }))
    },
    modName (name) {
      this.dialog_name = false
      this.sendToServer(webMethods.packageMsg(WEB.method.set, 
      this.selScene === 'todo' ? WEB.type.todo : WEB.type.set, {
        id: this.editObj.id,
        who: 'name',
        what: name
      }))
    },
   setTask (devid, key) {
      this.dialog_task = false
      var idx
      if (this.editTask === undefined) { //add
        idx = -1
      } else {
        idx = this.editTask.idx
      }
      this.sendToServer(webMethods.packageMsg(WEB.method.set, WEB.type.set, {
        id: this.editObj.id,
        who: this.dialog_taskTitle,
        what: { idx: idx, devid: devid, key: key }
      }))
      this.editTask = {}
      this.editObj = {}
    },
    delTask (set, taskid) {
      this.sendToServer(webMethods.packageMsg(WEB.method.set, WEB.type.set, {
        id: set.id,
        who: 'deltask',
        what: taskid
      }))
      this.editObj = {}
      this.editTask = {}
    },
    delSet (set) {
      this.sendToServer(webMethods.packageMsg(WEB.method.set, WEB.type.set, {
        id: set.id,
        who: 'del',
        what: 0
      }))
    },
    addTask (set) {
      this.editObj = set
      this.dialog_taskTitle = 'addtask'
      this.editTask = {}
      this.dialog_task = true
    },
    modTask (set, task) {
      this.editObj = set
      this.dialog_taskTitle = 'modtask'
      this.editTask = task
      this.dialog_task = true
    },
    getItemById: common.getItemById,
    getRoomNameById: common.getRoomNameById,
    getIconColorItem: getIconColorItem
  }
}
</script>

