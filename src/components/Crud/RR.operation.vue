<!--搜索与重置-->
<template>
  <span>
    <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="crud.toQuery">Search</el-button>
    <el-button v-if="crud.optShow.reset" class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="crud.resetQuery()">Reset</el-button>
  </span>
</template>
<script>
import { crud } from '@crud/crud'
export default {
  mixins: [crud()],
  props: {
    itemClass: {
      type: String,
      required: false,
      default: ''
    }
  }
}
</script>
