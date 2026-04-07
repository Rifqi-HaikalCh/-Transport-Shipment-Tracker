import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'shipments',
      component: () => import('@/views/ShipmentListView.vue'),
      meta: { title: 'Shipments — Transport Tracker' },
    },
    {
      path: '/shipments/:id',
      name: 'shipment-detail',
      component: () => import('@/views/ShipmentDetailView.vue'),
      meta: { title: 'Shipment Details — Transport Tracker' },
      props: true,
    },
  ],
})

// Update document title on route change
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = title
  }
})

export default router
