

<template>
  <div class="bb-search">
    <BBButton>
      <inline-svg
        :src="IconHome"
        aria-label="Retourner sur la page d'accueil"
      />
    </BBButton>
    <BBInput placeholder="Rechercher" />
    <BBButton>
      <inline-svg
        :src="IconSort"
        aria-label="Changer l'order des playlists"
      />
    </BBButton>
  </div>
</template>

<script lang="ts" setup>
import InlineSvg from 'vue-inline-svg'
import BBButton from '../../atoms/bb-button/bb-button.vue'
import BBInput from '../../atoms/bb-input/bb-input.vue'
import IconHome from '../../../assets/icons/i-home.svg'
import IconSort from '../../../assets/icons/i-sort.svg'
</script>

<style lang="scss">
.bb-search {
  width: 100%;
  padding: $bb-spacing-small;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: $bb-spacing-small;
}
</style>
