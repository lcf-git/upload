<template>

    <div class="container">
        <uploadSingle/>
        <uploadBase64/>
        <uploadSchedule/>
        <uploadThumbnail/>
        <uploadMultifile/>
        <!-- <uploadDrag/> -->
        <!-- <uploadLargeFiles/> -->
    </div>

</template>

<script setup>
    import uploadSingle from './uploadSingle.vue'  // 单一文件上传「FORM-DATA」(后端生成名字、时间戳区分、不去重)
    import uploadBase64 from './uploadBase64.vue'  // 单一文件上传「BASE64」，只适合图片 (后端生成名字、hash区分、文件去重)
    import uploadSchedule from './uploadSchedule.vue'  // 单一文件上传「缩略图处理」(前端生成名字、hash区分、文件去重)
    import uploadThumbnail from './uploadThumbnail.vue'  // 单一文件上传「进度管控」(后端生成名字、时间戳区分、不去重)
    import uploadMultifile from './uploadMultifile.vue'  // 多文件上传
    // import uploadDrag from './uploadDrag.vue'  // 拖拽上传
    // import uploadLargeFiles from './uploadLargeFiles.vue'  // 大文件上传
</script>

<style scoped>
    /* @import url(../assets/css/upload.css); */
</style>