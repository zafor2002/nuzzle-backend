import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, handleOptions } from '@/lib/api-response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            isAnonymous: true,
          },
        },
        healthLogs: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!pet) {
      return apiError('Pet not found', 404);
    }

    return apiSuccess(pet);
  } catch (error: any) {
    console.error('API /api/pets/[id] GET error:', error);
    return apiError('Failed to fetch pet', 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.pet.update({
      where: { id },
      data: {
        name: body.name,
        breed: body.breed,
        bio: body.bio,
        avatarUrl: body.avatarUrl,
        isAnonymous: body.isAnonymous,
      },
    });

    return apiSuccess(updated, 200, 'Pet updated successfully.');
  } catch (error: any) {
    console.error('API /api/pets/[id] PUT error:', error);
    return apiError('Failed to update pet', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.pet.delete({
      where: { id },
    });

    return apiSuccess({ id }, 200, 'Pet deleted successfully.');
  } catch (error: any) {
    console.error('API /api/pets/[id] DELETE error:', error);
    return apiError('Failed to delete pet', 500);
  }
}
