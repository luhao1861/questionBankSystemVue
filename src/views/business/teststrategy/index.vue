<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">Name</label>
        <el-input v-model="query.name" clearable placeholder="name" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">Multiple choices</label>
        <el-input v-model="query.mAmount" clearable placeholder="amount" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">Q&A</label>
        <el-input v-model="query.qAmount" clearable placeholder="amount" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">Fill in blank</label>
        <el-input v-model="query.fAmount" clearable placeholder="amount" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">Status</label>
        <!--        <el-input v-model="query.enabled" clearable placeholder="status" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />-->
        <el-select
          v-model="query.enabled"
          clearable
          size="small"
          placeholder="Status"
          class="filter-item"
          style="width: 90px"
          @change="crud.toQuery"
        ><el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="name" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="multiple choices amount">
            <el-input v-model="form.mAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="q&a amount">
            <el-input v-model="form.qAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="fill in blank amount">
            <el-input v-model="form.fAmount" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="status" prop="enabled">
            <el-radio v-for="item in dict.teststrategy_type" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="mAmount" label="Multiple Choices" />
        <el-table-column prop="qAmount" label="Q&A" />
        <el-table-column prop="fAmount" label="Fill in blank" />
        <el-table-column prop="enabled" label="Status">
          <template slot-scope="scope">
            {{ dict.label.teststrategy_type[scope.row.enabled] }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','testStrategy:edit','testStrategy:del'])" label="Operation" width="150px" align="center">
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
import crudTestStrategy from '@/api/business/testStrategy'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, mAmount: null, qAmount: null, fAmount: null, enabled: null }
export default {
  name: 'TestStrategy',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['teststrategy_type'],
  cruds() {
    return CRUD({ title: 'test strategy', url: 'api/testStrategy', idField: 'id', sort: 'id,desc', crudMethod: { ...crudTestStrategy }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'testStrategy:add'],
        edit: ['admin', 'testStrategy:edit'],
        del: ['admin', 'testStrategy:del']
      },
      rules: {
        name: [
          { required: true, message: 'Name cannot be empty', trigger: 'blur' }
        ],
        enabled: [
          { required: true, message: 'Status cannot be empty', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: 'name' },
        { key: 'mAmount', display_name: 'multiple choices amount' },
        { key: 'qAmount', display_name: 'q&a amount' },
        { key: 'fAmount', display_name: 'fill in blank amount' },
        { key: 'enabled', display_name: 'status' }
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
