import React from 'react'
import type { Program } from '../../types/program'
import { Button } from '../common/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface ProgramTableProps {
  programs: Program[]
  onView: (id: number) => void
  onEdit: (program: Program) => void
  onDelete: (id: number) => void
}

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <div className="lms-surface overflow-hidden">
      <Table data-testid="programs-table">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id} data-testid={`program-row-${program.id}`}>
              <TableCell className="font-medium text-primary">{program.id}</TableCell>
              <TableCell className="font-semibold text-foreground">{program.name}</TableCell>
              <TableCell className="text-muted-foreground">{program.description || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-testid={`view-program-${program.id}`}
                  onClick={() => program.id && onView(program.id)}
                >
                  View
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  data-testid={`edit-program-${program.id}`}
                  onClick={() => onEdit(program)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  data-testid={`delete-program-${program.id}`}
                  onClick={() => program.id && onDelete(program.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

