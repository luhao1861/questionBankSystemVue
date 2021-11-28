<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边课程数据-->
      <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4">
        <div class="head-container">
          <el-input
            v-model="courseName"
            clearable
            size="small"
            placeholder="Search by Course"
            prefix-icon="el-icon-search"
            class="filter-item"
            @input="searchCourseDatas"
          />
        </div>
        <el-tree
          :data="courseDatas"
          :load="getCourseDatas"
          :expand-on-click-node="false"
          :props="defaultProps"
          lazy
          @node-click="handleNodeClick"
        />
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--    &lt;!&ndash;工具栏&ndash;&gt;-->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input v-model="query.content" clearable placeholder="questionContent" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
            <!--  题型筛选      -->
            <el-select
              v-model="query.tid"
              clearable
              size="small"
              placeholder="Type"
              class="filter-item"
              style="width: 90px"
              @change="crud.toQuery"
            >
              <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
            </el-select>
            <el-input v-model="query.createBy" clearable placeholder="userName" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
            <rrOperation :crud="crud" />
          </div>
          <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
          <crudOperation :permission="permission" />
          <!--表单组件-->
          <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
            <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
              <el-form-item label="Content" prop="content">
                <el-input v-model="form.content" type="textarea" style="width: 370px;" />
              </el-form-item>
              <el-form-item label="type">
                <el-radio v-for="item in dict.question_type" :key="item.id" v-model="form.tid" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
              <el-form-item label="Course" prop="cids.id">
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
              <el-form-item label="Status" prop="enabled">
                <el-radio v-for="item in dict.question_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
              </el-form-item>
              <el-form-item label="answer">
                <el-input v-model="form.answer" type="textarea" style="width: 370px;" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="text" @click="crud.cancelCU">cancel</el-button>
              <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">confirm</el-button>
            </div>
          </el-dialog>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="content" label="questionContent" />
            <el-table-column prop="tid" label="Type">
              <template slot-scope="scope">
                {{ dict.label.question_type[scope.row.tid] }}
              </template>
            </el-table-column>
            <el-table-column prop="enabled" label="Status">
              <template slot-scope="scope">
                {{ dict.label.question_status[scope.row.enabled] }}
              </template>
            </el-table-column>
            <el-table-column :show-overflow-tooltip="true" prop="cids" label="Course">
              <template slot-scope="scope">
                <div>{{ scope.row.cids.name }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="createBy" label="Edited User" />
            <el-table-column v-if="checkPer(['admin','question:edit','question:del'])" label="Operation" width="150px" align="center">
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudQuestion from '@/api/business/question'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getCourses } from '@/api/system/sysClass'
// import Treeselect from '@riophae/vue-treeselect'
// import { mapGetters } from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
// import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

const defaultForm = { id: null, content: null, tid: null, cid: null, enabled: null, answer: null, createBy: null, createTime: null, cids: { id: null }, updateTime: null }
export default {
  name: 'Question',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['question_type', 'question_status'],
  cruds() {
    return CRUD({ title: 'question', url: 'api/question', idField: 'id', sort: 'id,desc', crudMethod: { ...crudQuestion }})
  },
  data() {
    return {
      courseName: '', courses: [],
      courseDatas: [],
      defaultProps: { children: 'children', label: 'name' },
      permission: {
        add: ['admin', 'question:add'],
        edit: ['admin', 'question:edit'],
        del: ['admin', 'question:del']
      },
      rules: {
        content: [
          { required: true, message: 'Question content cannot be empty', trigger: 'blur' }
        ],
        enabled: [
          { required: true, message: 'Status cannot be empty', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'content', display_name: 'questionContent' },
        { key: 'tid', display_name: 'typeId' },
        { key: 'createBy', display_name: 'userName' }
      ],
      enabledTypeOptions: [
        { key: '1', display_name: 'Multiple choices' },
        { key: '2', display_name: 'Q & A' },
        { key: '3', display_name: 'Fill in blank' }
      ]
    }
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    // [CRUD.HOOK.beforeRefresh]() {
    //   return true
    // },

    getCourseDatas(node, resolve) {
      const sort = 'id,desc'
      const params = { sort: sort }
      // if (node) {
      //   params['name'] = node
      // }
      setTimeout(() => {
        console.log(' 获取左侧课程数据')
        console.log(params)
        getCourses(params).then(res => {
          // resolve(res.content)
          console.log('resolve')
          console.log(resolve)
          this.courseDatas = res.content
          console.log(this.courseDatas)
        })
      }, 100)
    },
    searchCourseDatas(node, resolve) {
      const sort = 'id,desc'
      const params = { sort: sort }
      if (node) {
        params['name'] = node
      }
      setTimeout(() => {
        console.log(' 获取左侧课程数据')
        console.log(params)
        getCourses(params).then(res => {
          // resolve(res.content)
          console.log('resolve')
          console.log(resolve)
          this.courseDatas = res.content
          console.log(this.courseDatas)
        })
      }, 100)
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getCourses()
      // form.enabled = form.enabled.toString()
    },
    getCourses() {
      getCourses({ enabled: true }).then(res => {
        this.courses = res.content.map(function(obj) {
          return obj
        })
      })
    },
    // 提交前做的操作
    // [CRUD.HOOK.afterValidateCU](crud) {
    //   if (!crud.form.cids.id) {
    //     this.$message({
    //       message: 'Courses cannot be empty',
    //       type: 'warning'
    //     })
    //     return false
    //   }
    //   return true
    // },
    // 切换课程
    handleNodeClick(data) {
      console.log('111111111')
      console.log(data)
      console.log(this.query)
      this.query.cid = data.id
      this.crud.toQuery()
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
</style>
