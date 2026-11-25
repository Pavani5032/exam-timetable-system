package com.simats.exam.service;

import com.simats.exam.entity.Room;
import com.simats.exam.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getActiveRooms() {
        return roomRepository.findByIsActiveTrue();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found: " + id));
    }

    public Room createRoom(Room room) {
        if (roomRepository.existsByRoomNumber(room.getRoomNumber())) {
            throw new RuntimeException("Room with number " + room.getRoomNumber() + " already exists");
        }
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room updated) {
        Room existing = getRoomById(id);
        existing.setRoomNumber(updated.getRoomNumber());
        existing.setBuilding(updated.getBuilding());
        existing.setCapacity(updated.getCapacity());
        existing.setRoomType(updated.getRoomType());
        existing.setHasProjector(updated.getHasProjector());
        existing.setIsActive(updated.getIsActive());
        return roomRepository.save(existing);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}

