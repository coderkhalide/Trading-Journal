"use client"

import { useState, useMemo } from "react"

interface UsePaginationProps {
  totalItems: number
  initialPerPage?: number
  initialPage?: number
}

export function usePagination({ totalItems, initialPerPage = 20, initialPage = 1 }: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage)

  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage])
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage])
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage])

  const handleItemsPerPageChange = (newPerPage: number) => {
    setItemsPerPage(newPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToNextPage = () => {
    goToPage(currentPage + 1)
  }

  const goToPreviousPage = () => {
    goToPage(currentPage - 1)
  }

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    setItemsPerPage,
    handleItemsPerPageChange,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  }
}
