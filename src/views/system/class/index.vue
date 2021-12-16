<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <!--        <label class="el-form-item-label"></label>-->
        <el-input
          v-model="query.name"
          clearable
          placeholder="Course Name"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <!--        <date-range-picker v-model="query.createTime" class="date-item" />-->
        <el-select
          v-model="query.enabled"
          clearable
          size="small"
          placeholder="Status"
          class="filter-item"
          style="width: 90px"
          @change="crud.toQuery"
        >
          <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <date-range-picker
          v-model="query.createDate"
          start-placeholder="Create Date Start"
          end-placeholder="Create Date End"
          class="date-item"
        />
        <date-range-picker
          v-model="query.updateDate"
          start-placeholder="Update Date Start"
          end-placeholder="Update Date End"
          class="date-item"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="560px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="className" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="enabled" prop="enabled">
            <el-radio v-for="item in dict.class_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}
            </el-radio>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">cancel</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">confirm</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="className" />
        <el-table-column prop="createDate" label="createDate" />
        <el-table-column prop="updateDate" label="updatedate" />
        <el-table-column prop="enabled" label="enabled">
          <template slot-scope="scope">
            {{ dict.label.class_status[scope.row.enabled] }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkPer(['admin','sysClass:edit','sysClass:del'])"
          label="Operation"
          width="150px"
          align="center"
        >
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
import crudSysClass from '@/api/system/sysClass'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { id: null, name: null, createDate: null, updateDate: null, enabled: null }
export default {
  name: 'SysClass',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['class_status'],
  cruds() {
    return CRUD({
      title: 'class',
      url: 'api/sysClass',
      idField: 'id',
      sort: 'id,desc',
      crudMethod: { ...crudSysClass }
    })
  },
  data() {
    return {
      permission: {
        add: ['admin', 'sysClass:add'],
        edit: ['admin', 'sysClass:edit'],
        del: ['admin', 'sysClass:del']
      },
      rules: {
        name: [
          { required: true, message: 'Class Name cannot be empty', trigger: 'blur' }
        ],
        enabled: [
          { required: true, message: 'Enabled cannot be empty', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: 'className' },
        { key: 'enabled', display_name: 'enabled' }
      ],
      enabledTypeOptions: [
        { key: 'true', display_name: 'Available' },
        { key: 'false', display_name: 'Disabled' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
