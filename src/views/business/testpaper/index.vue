<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">Name</label>
        <el-input v-model="query.name" clearable placeholder="paper name" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!--  题型筛选      -->
        <label class="el-form-item-label">Test Strategy</label>
        <el-select
          v-model="query.tsids"
          clearable
          size="small"
          placeholder="Type"
          class="filter-item"
          style="width: 90px"
          @change="crud.toQuery"
        >
          <el-option v-for="item in testStrategyDatas" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <label class="el-form-item-label">Course</label>
        <el-select
          v-model="query.cids"
          clearable
          size="small"
          placeholder="Type"
          class="filter-item"
          style="width: 90px"
          @change="crud.toQuery"
        >
          <el-option v-for="item in courseDatas" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="560px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="Test Strategy" prop="tsids">
            <el-select v-model="form.tsids.id" style="width: 140px" placeholder="Test Strategy">
              <el-option
                v-for="item in testStrategyDatas"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="color: #8492a6; font-size: 13px">{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Course" prop="cids">
            <el-select v-model="form.cids.id" style="width: 140px" placeholder="Course">
              <el-option
                v-for="item in courseDatas"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="color: #8492a6; font-size: 13px">{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Description">
            <el-input v-model="form.description" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">Cancel</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">Confirm</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="false" prop="id" label="id" />
        <el-table-column prop="name" label="Paper Name" />
        <el-table-column :show-overflow-tooltip="true" prop="tsids" label="Test Strategy">
          <template slot-scope="scope">
            <div>{{ scope.row.tsids.name }}</div>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="cids" label="Course">
          <template slot-scope="scope">
            <div>{{ scope.row.cids.name }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="Created User" />
        <el-table-column align="right" width="55">
          <template slot-scope="scope">
            <el-button type="success" size="mini" @click="downloadpaper(scope.row)"><i class="el-icon-download" /></el-button>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','testPaper:edit','testPaper:del'])" label="Operation" width="150px" align="left">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudTestPaper from '@/api/business/testPaper'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getCourses } from '@/api/system/sysClass'
import { getTestStrategies } from '@/api/business/testStrategy'
import { downloadFile } from '@/utils/index'
import { download } from '../../../api/data'

const defaultForm = { id: null, name: null, tsid: null, cid: null, description: null, createBy: null, updateBy: null, createTime: null, updateTime: null, cids: { id: null }, tsids: { id: null }}
export default {
  name: 'TestPaper',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'test paper', url: 'api/testPaper', idField: 'id', sort: 'id,desc', crudMethod: { ...crudTestPaper }})
  },
  data() {
    return {
      courseDatas: [{ id: null, name: null }],
      testStrategyDatas: [{ id: null, name: null }],
      permission: {
        add: ['admin', 'testPaper:add'],
        edit: ['admin', 'testPaper:edit'],
        del: ['admin', 'testPaper:del']
      },
      rules: {
        name: [
          { required: true, message: 'Paper name cannot be empty', trigger: 'blur' }
        ],
        tsids: [
          { required: true, message: 'Test strategy cannot be empty', trigger: 'blur' }
        ],
        cids: [
          { required: true, message: 'Course cannot be empty', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: 'paper name' },
        { key: 'tsid', display_name: 'test strategy id' },
        { key: 'cid', display_name: 'course id' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      const sort = 'id,desc'
      const params = { sort: sort }
      this.getCourses(params)
      this.getTestStrategies(params)
      console.log('form:')
      console.log(this.form)
    },
    getCourses(params) {
      setTimeout(() => {
        console.log(' get courses info')
        console.log(params)
        getCourses(params).then(res => {
          this.courseDatas = res.content
          console.log(this.courseDatas)
        })
      }, 100)
    },
    getTestStrategies(params) {
      setTimeout(() => {
        console.log(' get test strategies info')
        console.log(params)
        getTestStrategies(params).then(res => {
          this.testStrategyDatas = res.content
          console.log(this.testStrategyDatas)
        })
      }, 100)
    },
    downloadpaper(data) {
      console.log('data')
      console.log(data)
      crud.downloadLoading = true
      download('api/testPaper/downloadpaper?id=' + JSON.stringify(data.id)).then(result => {
        downloadFile(result, data.cids.name, 'docx')
        crud.downloadLoading = false
      }).catch(() => {
        crud.downloadLoading = false
      })
    }

  }
}
</script>

<style scoped>

</style>
